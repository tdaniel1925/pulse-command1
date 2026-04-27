import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

interface AnalyzeTranscriptBody {
  clientId: string
  transcript: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeTranscriptBody = await request.json()
    const { clientId, transcript } = body

    if (!clientId || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId and transcript' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI not configured', details: 'OPENAI_API_KEY environment variable is not set' },
        { status: 503 }
      )
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a brand strategist. Analyze this onboarding interview transcript and extract structured information about the business. Return ONLY valid JSON with these exact keys:
{
  "businessDescription": "string",
  "uniqueValueProp": "string",
  "targetAudience": "string",
  "audiencePainPoints": "string",
  "competitors": "string",
  "differentiators": "string",
  "toneOfVoice": "string",
  "brandPersonality": "string",
  "contentPillars": ["string", "string", "string", "string", "string"],
  "keywords": ["string x10"],
  "hashtags": ["string x10"],
  "priorityChannels": ["string", "string", "string"],
  "postingFrequency": "string",
  "bestTimes": "string"
}`
        },
        {
          role: 'user',
          content: `Here is the onboarding interview transcript:\n\n${transcript}`
        }
      ],
      response_format: { type: 'json_object' }
    })

    const analysis = JSON.parse(completion.choices[0].message.content ?? '{}')

    const supabase = await createClient()

    // Get client's brand_profile_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, brand_profile_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Upsert brand profile with analysis results
    if (client.brand_profile_id) {
      const { error: profileError } = await supabase
        .from('brand_profiles')
        .update({
          business_description: analysis.businessDescription,
          unique_value_prop: analysis.uniqueValueProp,
          target_audience: analysis.targetAudience,
          audience_pain_points: analysis.audiencePainPoints,
          competitors: analysis.competitors,
          differentiators: analysis.differentiators,
          tone_of_voice: analysis.toneOfVoice,
          brand_personality: analysis.brandPersonality,
          content_pillars: analysis.contentPillars,
          keywords: analysis.keywords,
          hashtags: analysis.hashtags,
          priority_channels: analysis.priorityChannels,
          posting_frequency: analysis.postingFrequency,
          best_times: analysis.bestTimes,
        })
        .eq('id', client.brand_profile_id)

      if (profileError) console.error('Error updating brand profile:', profileError)
    }

    // Update client onboarding step
    await supabase
      .from('clients')
      .update({ onboarding_step: 'profile_built' })
      .eq('id', clientId)

    // Log activity
    await supabase.from('activities').insert({
      client_id: clientId,
      type: 'profile',
      title: 'Brand profile built from VAPI transcript',
      description: 'AI analysis completed and brand profile populated',
    })

    return NextResponse.json({ success: true, profile: analysis })
  } catch (error) {
    console.error('Analyze transcript error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
