import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = createAdminClient()

    const { data: demo } = await admin
      .from('demo_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (!demo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ status: demo.status, demo })
  } catch (err) {
    console.error('demo/status error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
