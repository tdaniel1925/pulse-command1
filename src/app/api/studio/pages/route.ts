export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/** List the current user's studio pages (for the dashboard). */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: client } = await admin.from('clients').select('id').eq('user_id', user.id).single()
  if (!client) return NextResponse.json({ pages: [] })

  const { data, error } = await admin
    .from('studio_pages')
    .select('id, title, kit, status, slug, updated_at, created_at')
    .eq('client_id', client.id)
    .order('updated_at', { ascending: false })
    .limit(100)
  if (error) {
    console.error('[studio/pages] list failed:', error)
    return NextResponse.json({ pages: [] })
  }
  // url isn't stored — derive it from the slug for live pages.
  const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const pages = (data ?? []).map((p) => ({
    ...p,
    url: p.status === 'live' && p.slug ? `${base}/p/${p.slug}` : null,
  }))
  return NextResponse.json({ pages })
}

/** Duplicate or delete a page. body: { action: 'duplicate'|'delete', pageId } */
export async function POST(request: NextRequest) {
  try {
    const { action, pageId } = (await request.json()) as { action?: string; pageId?: string }
    if (!pageId || (action !== 'duplicate' && action !== 'delete')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: client } = await admin.from('clients').select('id').eq('user_id', user.id).single()
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Confirm ownership.
    const { data: page } = await admin
      .from('studio_pages')
      .select('*')
      .eq('id', pageId)
      .eq('client_id', client.id)
      .single()
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    if (action === 'delete') {
      await admin.from('studio_pages').delete().eq('id', pageId).eq('client_id', client.id)
      return NextResponse.json({ ok: true })
    }

    // Duplicate: copy as a fresh draft (no slug, not live).
    const p = page as Record<string, unknown>
    const copy: Record<string, unknown> = {
      client_id: client.id,
      kit: p.kit ?? 'atlas',
      title: `${(p.title as string) ?? 'Untitled'} (copy)`,
      goal: p.goal ?? null,
      content: p.content ?? {},
      theme: p.theme ?? {},
      status: 'draft',
      slug: null,
      updated_at: new Date().toISOString(),
    }
    if ('layout' in p) copy.layout = p.layout
    if ('variants' in p) copy.variants = p.variants

    const { data: created, error } = await admin.from('studio_pages').insert(copy).select('id').single()
    if (error) {
      // Retry without optional columns if a migration is missing.
      delete copy.layout
      delete copy.variants
      const retry = await admin.from('studio_pages').insert(copy).select('id').single()
      if (retry.error) throw retry.error
      return NextResponse.json({ id: retry.data.id })
    }
    return NextResponse.json({ id: created.id })
  } catch (err) {
    console.error('[studio/pages] action failed:', err)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
