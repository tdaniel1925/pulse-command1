import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json()
    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch client + brand profile
    const { data: client } = await admin
      .from('clients')
      .select('id, brand_profile_id, business_name, first_name')
      .eq('id', clientId)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { data: profile } = await admin
      .from('brand_profiles')
      .select('*')
      .eq('id', client.brand_profile_id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    const businessContext = `
Business: ${client.business_name ?? 'Unknown'}
Description: ${profile.business_description ?? ''}
Unique Value Proposition: ${profile.unique_value_prop ?? ''}
Target Audience: ${profile.target_audience ?? ''}
Pain Points: ${profile.audience_pain_points ?? ''}
Tone of Voice: ${profile.tone_of_voice ?? ''}
Brand Personality: ${profile.brand_personality ?? ''}
Content Pillars: ${(profile.content_pillars ?? []).join(', ')}
Keywords: ${(profile.keywords ?? []).join(', ')}
Priority Channels: ${(profile.priority_channels ?? []).join(', ')}
`

    const message = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `You are a content strategist. Based on this brand profile, create a monthly content brief. Return ONLY valid JSON with these exact keys:
{
  "socialPostsCopy": ["post 1 text", "post 2 text", "post 3 text", "post 4 text", "post 5 text"],
  "videoScript": "Full video script here, 60-90 seconds when read aloud",
  "audioScript": "Full podcast/audio script here, 3-5 minutes when read aloud",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"],
  "contentPillars": ["pillar 1", "pillar 2", "pillar 3"]
}

Brand Profile:
${businessContext}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const brief = JSON.parse(jsonStr)

    // Save to content_briefs
    const { data: savedBrief } = await admin
      .from('content_briefs')
      .insert({
        client_id: clientId,
        social_posts_copy: brief.socialPostsCopy?.join('\n\n---\n\n') ?? '',
        video_script: brief.videoScript ?? '',
        audio_script: brief.audioScript ?? '',
        hashtags: brief.hashtags ?? [],
        content_pillars: brief.contentPillars ?? [],
        raw_json: brief,
      })
      .select()
      .single()

    // Log activity
    await admin.from('activities').insert({
      client_id: clientId,
      type: 'onboarding_step',
      title: 'Content brief ready for admin review',
      description: 'AI-generated content brief is ready. Admin can review and create posts manually.',
      created_by: 'system',
    })

    return NextResponse.json({ success: true, briefId: savedBrief?.id })
  } catch (err) {
    console.error('generate-brief error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
