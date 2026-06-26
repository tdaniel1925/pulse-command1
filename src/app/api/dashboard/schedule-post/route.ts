export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Schedule (or reschedule) one of the logged-in client's posts to a future time,
 * or publish it now. Used by the calendar (drag-to-reschedule) and post modal.
 *
 * body: { postId: string, scheduledFor?: string, publishNow?: boolean }
 *  - scheduledFor → set scheduled_at and hand to Zernio for future publishing.
 *  - publishNow   → publish immediately via Zernio.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: client } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const { postId, scheduledFor, publishNow } = (await req.json()) as {
      postId?: string; scheduledFor?: string; publishNow?: boolean
    }
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

    // Confirm the post belongs to this client.
    const { data: post } = await admin
      .from('social_posts')
      .select('id, client_id, status')
      .eq('id', postId)
      .eq('client_id', client.id)
      .single()
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const validScheduledFor = scheduledFor && !Number.isNaN(Date.parse(scheduledFor))
      ? new Date(scheduledFor).toISOString()
      : null

    // Already-published posts can't be rescheduled.
    if (post.status === 'published') {
      return NextResponse.json({ error: 'This post is already published.' }, { status: 400 })
    }

    if (publishNow || (validScheduledFor && new Date(validScheduledFor).getTime() <= Date.now())) {
      // Publish immediately via the Zernio publish route.
      const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
      const res = await fetch(`${base}/api/zernio/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return NextResponse.json({ error: data.error ?? 'Publish failed' }, { status: 502 })
      return NextResponse.json({ ok: true, status: 'published' })
    }

    if (!validScheduledFor) {
      return NextResponse.json({ error: 'A valid scheduledFor date is required.' }, { status: 400 })
    }

    // Future date → record the schedule and hand to Zernio for timed publishing.
    await admin
      .from('social_posts')
      .update({ status: 'scheduled', scheduled_at: validScheduledFor })
      .eq('id', postId)

    // Best-effort: register the schedule with Zernio. If the client has no
    // connected accounts yet, the row still holds the intended date.
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
      await fetch(`${base}/api/zernio/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, scheduledFor: validScheduledFor }),
      })
    } catch {
      // non-fatal — the post is recorded as scheduled regardless
    }

    return NextResponse.json({ ok: true, status: 'scheduled', scheduledFor: validScheduledFor })
  } catch (err) {
    console.error('[dashboard/schedule-post]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
