import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = user.user_metadata?.role
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { heygenVideoId } = await request.json()
    if (!heygenVideoId) {
      return NextResponse.json({ error: 'Missing heygenVideoId' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Find the latest pending video for this client and link it
    const { data: video } = await admin
      .from('videos')
      .select('id')
      .eq('client_id', clientId)
      .in('status', ['pending', 'pending_approval', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (video) {
      await admin
        .from('videos')
        .update({ heygen_video_id: heygenVideoId })
        .eq('id', video.id)
    } else {
      // No pending video — create one
      await admin.from('videos').insert({
        client_id: clientId,
        title: 'HeyGen Video',
        heygen_video_id: heygenVideoId,
        status: 'processing',
      })
    }

    await admin.from('activities').insert({
      client_id: clientId,
      type: 'video',
      title: 'HeyGen video linked by admin',
      description: `Video ID ${heygenVideoId} linked manually.`,
      created_by: 'admin',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('link-heygen-video error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
