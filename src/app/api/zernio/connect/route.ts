import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getZernioConnectUrl, zernioConfigured, type ZernioPlatform } from '@/lib/zernio'
import { ensureZernioProfile } from '@/lib/zernio-profile'

const PLATFORMS: ZernioPlatform[] = [
  'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube',
  'threads', 'reddit', 'pinterest', 'bluesky', 'googlebusiness',
  'telegram', 'snapchat', 'discord', 'whatsapp',
]

/**
 * GET /api/zernio/connect?platform=instagram
 * Returns the OAuth authUrl for the user to authorize that platform. Zernio
 * redirects back to /api/zernio/callback with the new accountId.
 */
export async function GET(req: NextRequest) {
  try {
    if (!zernioConfigured()) {
      return NextResponse.json({ error: 'Social posting is not configured yet.' }, { status: 503 })
    }
    const platform = req.nextUrl.searchParams.get('platform') as ZernioPlatform | null
    if (!platform || !PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: 'Invalid or missing platform' }, { status: 400 })
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
    if (!profileId) return NextResponse.json({ error: 'Could not create Zernio profile' }, { status: 500 })

    const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const redirectUrl = `${base}/api/zernio/callback`
    const authUrl = await getZernioConnectUrl({ platform, profileId, redirectUrl })

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('[/api/zernio/connect]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate connect URL' },
      { status: 500 },
    )
  }
}
