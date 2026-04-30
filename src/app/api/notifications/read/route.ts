import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
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

  const body = await req.json().catch(() => ({}))
  const { id } = body as { id?: string }

  const query = admin
    .from('notifications')
    .update({ read: true })
    .eq('client_id', client.id)

  if (id) {
    await query.eq('id', id)
  } else {
    await query.eq('read', false)
  }

  return NextResponse.json({ ok: true })
}
