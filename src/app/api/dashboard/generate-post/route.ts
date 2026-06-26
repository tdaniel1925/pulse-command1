export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePostForClient } from '@/lib/generate-post-for-client'

/**
 * On-demand post generation for the logged-in client. Always creates a DRAFT
 * for review (never auto-publishes), optionally about a specific topic/prompt
 * and optionally scheduled for a future date.
 * body: { topic?: string, scheduledFor?: string }
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

    const body = (await req.json().catch(() => ({}))) as { topic?: string; scheduledFor?: string }
    const topic = typeof body.topic === 'string' && body.topic.trim() ? body.topic.trim().slice(0, 200) : undefined
    const scheduledFor = body.scheduledFor && !Number.isNaN(Date.parse(body.scheduledFor))
      ? new Date(body.scheduledFor).toISOString()
      : undefined

    const result = await generatePostForClient(client.id, { topic, scheduledFor, mode: 'draft' })
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? 'Generation failed' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, postId: result.postId })
  } catch (err) {
    console.error('[dashboard/generate-post]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
