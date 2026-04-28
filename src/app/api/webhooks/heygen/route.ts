import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface HeyGenEventData {
  video_id: string
  video_url: string
  status: string
  thumbnail_url?: string
}

interface HeyGenWebhookPayload {
  event_type: string
  event_data: HeyGenEventData
}

export async function POST(request: NextRequest) {
  try {
    const payload: HeyGenWebhookPayload = await request.json()
    const { event_type, event_data } = payload

    console.log('HeyGen webhook:', event_type, event_data?.video_id)

    if (event_type !== 'avatar_video.success' && event_type !== 'video.complete') {
      return NextResponse.json({ received: true })
    }

    const { video_id, video_url, thumbnail_url } = event_data
    const admin = createAdminClient()

    // Update video record by heygen_video_id
    const { data: video, error: videoErr } = await admin
      .from('videos')
      .update({
        status: 'ready',
        url: video_url,
        ...(thumbnail_url ? { thumbnail_url } : {}),
      })
      .eq('heygen_video_id', video_id)
      .select('id, client_id, title')
      .single()

    if (videoErr || !video) {
      console.log('No video found for heygen_video_id:', video_id, videoErr?.message)
      return NextResponse.json({ received: true })
    }

    // Log activity
    await admin.from('activities').insert({
      client_id: video.client_id,
      type: 'video',
      title: 'AI video ready',
      description: `"${video.title ?? 'Video'}" has finished rendering and is ready to view.`,
      created_by: 'system',
    })

    console.log('HeyGen video marked ready:', video_id, 'client:', video.client_id)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('HeyGen webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
