import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ existingDemoId: null })

    const admin = createAdminClient()

    // Check for existing completed demo with same email
    const { data: existing } = await admin
      .from('demo_requests')
      .select('id, status, created_at')
      .eq('email', email.toLowerCase().trim())
      .in('status', ['done', 'generating'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ existingDemoId: existing.id, status: existing.status })
    }

    // Check IP rate limit — max 3 demos per IP per 24h
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    if (ip !== 'unknown') {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await admin
        .from('demo_requests')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', since)

      if ((count ?? 0) >= 3) {
        return NextResponse.json({ rateLimited: true, existingDemoId: null })
      }
    }

    return NextResponse.json({ existingDemoId: null })
  } catch (err) {
    console.error('demo/check error:', err)
    return NextResponse.json({ existingDemoId: null }) // fail open
  }
}
