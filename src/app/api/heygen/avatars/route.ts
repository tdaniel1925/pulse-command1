import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const key = process.env.HEYGEN_API_KEY
    if (!key) return NextResponse.json({ error: 'HeyGen not configured' }, { status: 500 })

    const res = await fetch('https://api.heygen.com/v2/avatars', {
      headers: { 'X-Api-Key': key },
      next: { revalidate: 3600 }, // cache for 1 hour
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch avatars from HeyGen' }, { status: 500 })
    }

    const data = await res.json()
    const avatars: { avatar_id: string; avatar_name: string; preview_image_url: string; gender: string }[] = data.data?.avatars ?? []

    // UUID pattern — custom/client avatars have 32-char hex IDs
    const uuidRe = /^[0-9a-f]{32}$/i

    // Keep only stock (non-UUID) avatars, dedupe, require preview image
    const seen = new Set<string>()
    const clean = avatars
      .filter(a => {
        if (uuidRe.test(a.avatar_id)) return false // skip custom/client avatars
        if (seen.has(a.avatar_id)) return false
        seen.add(a.avatar_id)
        if (!a.preview_image_url) return false
        return true
      })
      .slice(0, 12)
      .map(a => ({
        id: a.avatar_id,
        name: a.avatar_name,
        preview: a.preview_image_url,
        gender: a.gender ?? 'unknown',
      }))

    return NextResponse.json(clean)
  } catch (err) {
    console.error('heygen/avatars error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
