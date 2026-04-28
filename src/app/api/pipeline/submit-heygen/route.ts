import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { videoId, clientId } = await request.json()
    const admin = createAdminClient()

    const { data: video } = await admin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('client_id', clientId)
      .single()

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const { data: brandProfile } = await admin
      .from('brand_profiles')
      .select('heygen_avatar_id, elevenlabs_voice_id')
      .eq('client_id', clientId)
      .single()

    const avatarId = brandProfile?.heygen_avatar_id ?? process.env.HEYGEN_DEFAULT_AVATAR_ID ?? ''
    const voiceId = brandProfile?.elevenlabs_voice_id ?? process.env.HEYGEN_DEFAULT_VOICE_ID ?? ''

    if (!avatarId) {
      console.error('No HeyGen avatar ID for client:', clientId)
      await admin.from('videos').update({ status: 'failed' }).eq('id', videoId)
      return NextResponse.json({ error: 'No avatar ID configured' }, { status: 400 })
    }

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
            avatar_id: avatarId,
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: video.script ?? '',
            voice_id: voiceId,
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
      await admin.from('videos').update({ status: 'failed' }).eq('id', videoId)
      return NextResponse.json({ error: 'HeyGen API error', detail: errText }, { status: 502 })
    }

    const heygenData = await heygenRes.json()
    const heygenVideoId = heygenData.data?.video_id ?? heygenData.video_id

    await admin.from('videos').update({
      heygen_video_id: heygenVideoId,
      status: 'rendering',
    }).eq('id', videoId)

    await admin.from('activities').insert({
      client_id: clientId,
      type: 'video',
      title: 'Video submitted to HeyGen',
      description: `Rendering started. HeyGen ID: ${heygenVideoId}. Will update when complete.`,
      created_by: 'system',
    })

    return NextResponse.json({ success: true, heygenVideoId })
  } catch (err) {
    console.error('submit-heygen error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
