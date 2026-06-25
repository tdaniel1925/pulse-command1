export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/** Load one studio page (full content/theme/layout/variants) for editing. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: client } = await admin.from('clients').select('id').eq('user_id', user.id).single()
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data, error } = await admin
    .from('studio_pages')
    .select('*')
    .eq('id', id)
    .eq('client_id', client.id)
    .single()
  if (error || !data) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const p = data as Record<string, unknown>
  return NextResponse.json({
    id: p.id,
    title: p.title ?? null,
    goal: p.goal ?? '',
    kit: p.kit ?? 'atlas',
    content: p.content ?? {},
    theme: p.theme ?? {},
    layout: p.layout ?? null,
    variants: p.variants ?? null,
    status: p.status ?? 'draft',
    slug: p.slug ?? null,
    url: p.status === 'live' && p.slug ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/p/${p.slug}` : null,
  })
}
