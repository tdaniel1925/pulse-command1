export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Retry a failed post for the logged-in client. Re-runs the Zernio publish for a
 * post the client owns (only when it's in a failed/draft state).
 * body: { postId: string }
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

    const { postId } = (await req.json()) as { postId?: string }
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

    const { data: post } = await admin
      .from('social_posts')
      .select('id, status')
      .eq('id', postId)
      .eq('client_id', client.id)
      .single()
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.status === 'published') {
      return NextResponse.json({ error: 'This post is already published.' }, { status: 400 })
    }

    const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const res = await fetch(`${base}/api/zernio/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return NextResponse.json({ error: data.error ?? 'Retry failed' }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[dashboard/retry-post]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
