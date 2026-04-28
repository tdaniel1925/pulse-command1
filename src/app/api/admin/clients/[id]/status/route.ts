import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, onboarding_step } = body

    const admin = createAdminClient()
    const { error } = await admin
      .from('clients')
      .update({
        ...(status ? { status } : {}),
        ...(onboarding_step ? { onboarding_step } : {}),
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/clients/status]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
