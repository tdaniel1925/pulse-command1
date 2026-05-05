import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createVideoShort, pollUntilDone } from '@/lib/autocontent'

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

    if (!process.env.AUTOCONTENT_API_KEY) {
      console.error('AUTOCONTENT_API_KEY not set')
      await admin.from('videos').update({ status: 'failed' }).eq('id', videoId)
      return NextResponse.json({ error: 'AutoContent API not configured' }, { status: 400 })
    }

    const { data: brandProfile } = await admin
      .from('brand_profiles')
      .select('heygen_avatar_id')
      .eq('client_id', clientId)
      .single()

    // Use client's avatar preference or default to avatar 1
    const avatarId = brandProfile?.heygen_avatar_id ?? '1'

    await admin.from('videos').update({ status: 'rendering' }).eq('id', videoId)

    // Create video short via AutoContent
    const req = await createVideoShort({
      text: video.script ?? '',
      avatar1: avatarId,
      subtitles: true,
      prompt: 'Create a professional, engaging short video for social media',
    })

    // Poll until done (max 5 min)
    const result = await pollUntilDone(req.request_id, {
      maxWaitMs: 300_000,
      intervalMs: 10_000,
    })

    if (!result.videoUrl) {
      await admin.from('videos').update({ status: 'failed' }).eq('id', videoId)
      return NextResponse.json({ error: 'No video URL returned' }, { status: 502 })
    }

    await admin.from('videos').update({
      status: 'ready',
      url: result.videoUrl,
    }).eq('id', videoId)

    await admin.from('activities').insert({
      client_id: clientId,
      type: 'video',
      title: 'Video short ready',
      description: 'AI presenter video generated via AutoContent. Available in your dashboard.',
      created_by: 'system',
    })

    return NextResponse.json({ success: true, videoUrl: result.videoUrl, shareUrl: result.shareUrl })
  } catch (err) {
    console.error('submit-video error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
