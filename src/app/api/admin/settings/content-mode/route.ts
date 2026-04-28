import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = user.user_metadata?.role
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data } = await admin
      .from('app_settings')
      .select('value')
      .eq('key', 'content_mode')
      .single()

    return NextResponse.json({ mode: data?.value ?? 'manual' })
  } catch (err) {
    console.error('content-mode GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = user.user_metadata?.role
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { mode } = await request.json()
    if (mode !== 'auto' && mode !== 'manual') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin
      .from('app_settings')
      .upsert({ key: 'content_mode', value: mode, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    return NextResponse.json({ success: true, mode })
  } catch (err) {
    console.error('content-mode POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
