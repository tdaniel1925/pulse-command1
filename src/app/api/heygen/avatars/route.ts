import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// In-memory cache of full HeyGen list (refreshed every 24h)
let cachedAll: { id: string; name: string; preview: string; gender: string }[] | null = null
let cacheExpiry = 0

const uuidRe = /^[0-9a-f]{32}$/i

async function fetchAndCacheFromHeyGen(): Promise<typeof cachedAll> {
  const key = process.env.HEYGEN_API_KEY
  if (!key) return []

  const res = await fetch('https://api.heygen.com/v2/avatars', {
    headers: { 'X-Api-Key': key },
  })
  if (!res.ok) return cachedAll ?? []

  const data = await res.json()
  const raw: { avatar_id: string; avatar_name: string; preview_image_url: string; gender: string }[] =
    data.data?.avatars ?? []

  const seen = new Set<string>()
  const filtered = raw
    .filter(a => {
      if (uuidRe.test(a.avatar_id)) return false
      if (seen.has(a.avatar_id)) return false
      seen.add(a.avatar_id)
      if (!a.preview_image_url) return false
      return true
    })
    .map(a => ({
      id: a.avatar_id,
      name: a.avatar_name,
      preview: a.preview_image_url,
      gender: a.gender ?? 'unknown',
    }))

  cachedAll = filtered
  cacheExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24h

  // Upsert all into DB in background so future cold starts are instant
  const admin = createAdminClient()
  Promise.resolve(
    admin
      .from('heygen_avatars')
      .upsert(filtered.map(a => ({ id: a.id, name: a.name, preview: a.preview, gender: a.gender })), { onConflict: 'id' })
  )
    .then(() => console.log(`heygen_avatars: upserted ${filtered.length} rows`))
    .catch((err: unknown) => console.error('heygen_avatars upsert error:', err))

  return filtered
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '0')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '96'), 200)
    const start = page * pageSize

    const admin = createAdminClient()

    // Page 0 — try DB first for instant response
    if (page === 0) {
      const { data: dbRows, count } = await admin
        .from('heygen_avatars')
        .select('id, name, preview, gender', { count: 'exact' })
        .order('name')
        .range(0, pageSize - 1)

      if (dbRows && dbRows.length > 0) {
        const total = count ?? dbRows.length
        const hasMore = total > pageSize

        // Refresh HeyGen list in background if cache is stale
        if (!cachedAll || Date.now() > cacheExpiry) {
          void fetchAndCacheFromHeyGen()
        }

        return NextResponse.json({ avatars: dbRows, hasMore, total, source: 'db' })
      }
    }

    // Not in DB yet (or page > 0) — fetch from HeyGen with in-memory cache
    if (!cachedAll || Date.now() > cacheExpiry) {
      await fetchAndCacheFromHeyGen()
    }

    const all = cachedAll ?? []
    const slice = all.slice(start, start + pageSize)
    const hasMore = start + pageSize < all.length

    return NextResponse.json({ avatars: slice, hasMore, total: all.length, source: 'api' })
  } catch (err) {
    console.error('heygen/avatars error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
