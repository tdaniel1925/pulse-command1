import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
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

  const { data: notifications } = await admin
    .from('notifications')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length

  return NextResponse.json({ notifications: notifications ?? [], unreadCount })
}
