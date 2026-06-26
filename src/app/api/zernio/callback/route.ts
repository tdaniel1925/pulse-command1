import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Zernio OAuth redirect target. On success Zernio appends:
 *   ?connected={platform}&profileId=X&accountId=Y&username=Z
 * We record the connected platform on the client (matched by profileId) and
 * bounce the user back to settings. Account ids themselves live in Zernio and are
 * fetched on demand via /v1/accounts, so we only need to track which platforms
 * are connected for the status UI.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const connected = params.get('connected')
  const profileId = params.get('profileId')
  const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const back = (status: string) => NextResponse.redirect(`${base}/dashboard/settings?social=${status}`)

  if (!connected || !profileId) return back('error')

  try {
    const admin = createAdminClient()
    const { data: client } = await admin
      .from('clients')
      .select('id, zernio_connected_platforms')
      .eq('zernio_profile_id', profileId)
      .single()

    if (client) {
      const current: string[] = Array.isArray(client.zernio_connected_platforms)
        ? (client.zernio_connected_platforms as string[])
        : []
      const next = [...new Set([...current, connected])]
      await admin
        .from('clients')
        .update({ zernio_connected_platforms: next })
        .eq('id', client.id)
    }
  } catch (err) {
    // Column/profile lookup may fail if the migration hasn't run; the account is
    // still connected in Zernio, so don't block the user — just log it.
    console.warn('[/api/zernio/callback] could not record platform:', err instanceof Error ? err.message : err)
  }

  return back('connected')
}
