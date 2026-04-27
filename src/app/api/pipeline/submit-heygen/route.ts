import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { videoId, clientId } = await request.json()

    const supabase = await createClient()

    // Fetch video record
    const { data: video } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('client_id', clientId)
      .single()

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Fetch client brand profile for avatar/voice config
    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single()

    // HeyGen video generation API
    // Docs: https://docs.heygen.com/reference/create-an-avatar-video-v2
    const heygenRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            // avatar_id must be set per-client after HeyGen verification
            avatar_id: brandProfile?.metadata?.heygen_avatar_id ?? process.env.HEYGEN_DEFAULT_AVATAR_ID ?? '',
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: video.script ?? '',
            voice_id: brandProfile?.metadata?.heygen_voice_id ?? process.env.HEYGEN_DEFAULT_VOICE_ID ?? '',
          },
        }],
        dimension: { width: 1280, height: 720 },
        aspect_ratio: '16:9',
        test: false,
      }),
    })

    if (!heygenRes.ok) {
      const errText = await heygenRes.text()
      console.error('HeyGen API error:', errText)
      await supabase.from('videos').update({ status: 'failed' }).eq('id', videoId)
      return NextResponse.json({ error: 'HeyGen API error', detail: errText }, { status: 502 })
    }

    const heygenData = await heygenRes.json()
    const heygenVideoId = heygenData.data?.video_id ?? heygenData.video_id

    // Update video record with HeyGen video ID, status → rendering
    await supabase.from('videos').update({
      heygen_video_id: heygenVideoId,
      status: 'rendering',
    }).eq('id', videoId)

    // Log activity
    await supabase.from('activities').insert({
      client_id: clientId,
      type: 'content_published',
      title: 'Video submitted to HeyGen for rendering',
      description: `HeyGen video ID: ${heygenVideoId}. Webhook will update status when complete.`,
      created_by: 'system',
    })

    return NextResponse.json({ success: true, heygenVideoId })
  } catch (err) {
    console.error('submit-heygen error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
