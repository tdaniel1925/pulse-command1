import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const admin = createAdminClient()

    const { data: video, error: fetchErr } = await admin
      .from('videos')
      .select('id, status, heygen_video_id, video_url, thumbnail_url, client_id')
      .eq('id', id)
      .single()

    if (fetchErr || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Verify ownership
    const { data: client } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!client || video.client_id !== client.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Already in a terminal state — return as-is
    if (!video.heygen_video_id || video.status === 'ready' || video.status === 'pending_review' || video.status === 'approved' || video.status === 'rejected') {
      return NextResponse.json({
        status: video.status,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
      })
    }

    const heygenApiKey = process.env.HEYGEN_API_KEY
    if (!heygenApiKey) {
      return NextResponse.json({ status: video.status, video_url: null, thumbnail_url: null })
    }

    // Poll HeyGen for status
    const heygenRes = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${video.heygen_video_id}`,
      {
        headers: { 'X-Api-Key': heygenApiKey },
      }
    )

    if (!heygenRes.ok) {
      return NextResponse.json({ status: video.status, video_url: video.video_url, thumbnail_url: video.thumbnail_url })
    }

    const heygenData = await heygenRes.json()
    const heygenStatus: string = heygenData.data?.status ?? ''
    const videoUrl: string | null = heygenData.data?.video_url ?? null
    const thumbnailUrl: string | null = heygenData.data?.thumbnail_url ?? null

    if (heygenStatus === 'completed') {
      await admin
        .from('videos')
        .update({ status: 'pending_review', video_url: videoUrl, thumbnail_url: thumbnailUrl })
        .eq('id', id)

      return NextResponse.json({ status: 'pending_review', video_url: videoUrl, thumbnail_url: thumbnailUrl })
    }

    return NextResponse.json({ status: video.status, video_url: video.video_url, thumbnail_url: video.thumbnail_url })
  } catch (err) {
    console.error('[videos/status] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
