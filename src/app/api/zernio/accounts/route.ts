import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listZernioAccounts, zernioConfigured } from '@/lib/zernio'

/** List the current client's connected Zernio social accounts. */
export async function GET() {
  try {
    if (!zernioConfigured()) return NextResponse.json({ accounts: [] })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    let profileId: string | null = null
    try {
      const { data: client } = await admin
        .from('clients')
        .select('zernio_profile_id')
        .eq('user_id', user.id)
        .single()
      profileId = (client?.zernio_profile_id as string | null) ?? null
    } catch {
      profileId = null
    }

    if (!profileId) return NextResponse.json({ accounts: [] })
    const accounts = await listZernioAccounts(profileId)
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('[/api/zernio/accounts]', error)
    return NextResponse.json({ accounts: [] })
  }
}
