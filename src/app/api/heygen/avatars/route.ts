import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Cache the full filtered list in memory for 1 hour
let cachedAvatars: { id: string; name: string; preview: string; gender: string }[] | null = null
let cacheExpiry = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '0')
    const pageSize = 24

    const key = process.env.HEYGEN_API_KEY
    if (!key) return NextResponse.json({ error: 'HeyGen not configured' }, { status: 500 })

    // Use in-memory cache to avoid fetching 1300 avatars on every page load
    if (!cachedAvatars || Date.now() > cacheExpiry) {
      const res = await fetch('https://api.heygen.com/v2/avatars', {
        headers: { 'X-Api-Key': key },
      })

      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch avatars from HeyGen' }, { status: 500 })
      }

      const data = await res.json()
      const avatars: { avatar_id: string; avatar_name: string; preview_image_url: string; gender: string }[] = data.data?.avatars ?? []

      // UUID pattern — custom/client avatars have 32-char hex IDs
      const uuidRe = /^[0-9a-f]{32}$/i

      const seen = new Set<string>()
      cachedAvatars = avatars
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

      cacheExpiry = Date.now() + 60 * 60 * 1000 // 1 hour
    }

    const start = page * pageSize
    const slice = cachedAvatars.slice(start, start + pageSize)
    const hasMore = start + pageSize < cachedAvatars.length

    return NextResponse.json({ avatars: slice, hasMore, total: cachedAvatars.length })
  } catch (err) {
    console.error('heygen/avatars error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
