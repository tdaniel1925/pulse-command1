import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { zernioConfigured } from '@/lib/zernio'
import { ensureZernioProfile } from '@/lib/zernio-profile'

/** Ensure the current user's client has a Zernio profile. */
export async function POST() {
  try {
    if (!zernioConfigured()) {
      return NextResponse.json({ error: 'Social posting is not configured yet.' }, { status: 503 })
    }
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

    const profileId = await ensureZernioProfile(admin, client.id)
    return NextResponse.json({ profileId })
  } catch (error) {
    console.error('[/api/zernio/init]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize Zernio profile' },
      { status: 500 },
    )
  }
}
