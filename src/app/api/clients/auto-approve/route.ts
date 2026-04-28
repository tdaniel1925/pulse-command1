import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { clientId, autoApprove } = await req.json()
    if (!clientId || typeof autoApprove !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only allow the client owner to change this
    const { error } = await supabase
      .from('clients')
      .update({ auto_approve: autoApprove })
      .eq('id', clientId)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auto-approve]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
