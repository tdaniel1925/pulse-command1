import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteZernioProfile } from '@/lib/zernio'

/** Disconnect all social accounts by deleting the client's Zernio profile. */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    let profileId: string | null = null
    try {
      const { data: client } = await admin
        .from('clients')
        .select('id, zernio_profile_id')
        .eq('user_id', user.id)
        .single()
      profileId = (client?.zernio_profile_id as string | null) ?? null
      if (profileId) await deleteZernioProfile(profileId)
      await admin
        .from('clients')
        .update({ zernio_profile_id: null, zernio_connected_platforms: [] })
        .eq('user_id', user.id)
    } catch (err) {
      console.warn('[/api/zernio/disconnect]', err instanceof Error ? err.message : err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[/api/zernio/disconnect]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect' },
      { status: 500 },
    )
  }
}
