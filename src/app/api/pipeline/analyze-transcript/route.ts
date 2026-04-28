import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic not configured' },
        { status: 503 }
      )
    }

    // Use Claude Opus for high-quality brand analysis
    const message = await getAnthropic().messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
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
}

Here is the onboarding interview transcript:

${transcript}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const analysis = JSON.parse(jsonStr)

    const admin = createAdminClient()

    // Get client's brand_profile_id
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id, brand_profile_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Update brand profile with analysis results
    if (client.brand_profile_id) {
      const { error: profileError } = await admin
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
    await admin
      .from('clients')
      .update({ onboarding_step: 'profile_built' })
      .eq('id', clientId)

    // Log activity
    await admin.from('activities').insert({
      client_id: clientId,
      type: 'onboarding_step',
      title: 'Brand profile built from VAPI transcript',
      description: 'Claude Opus analysis completed. Auto-triggering content generation.',
      created_by: 'system',
    })

    // Auto-trigger all content generation — fire and forget
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const generateContent = (type: string) =>
      fetch(`${baseUrl}/api/pipeline/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, type }),
      }).catch(err => console.error(`Auto-generate ${type} failed:`, err))

    Promise.all([
      generateContent('social'),
      generateContent('audio'),
      generateContent('video'),
    ]).then(() => console.log('Auto content generation complete for client:', clientId))

    return NextResponse.json({ success: true, profile: analysis, autoGenerating: true })
  } catch (error) {
    console.error('Analyze transcript error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
