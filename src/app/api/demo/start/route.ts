import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, website, topService, idealCustomer, differentiator } = await request.json()
    if (!name || !email || !website) {
      return NextResponse.json({ error: 'Name, email, and website are required' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    const admin = createAdminClient()

    const row: Record<string, unknown> = {
      name,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      website,
      status: 'pending',
    }
    // Optional columns — only include if they exist in the schema
    if (topService) row.top_service = topService
    if (idealCustomer) row.ideal_customer = idealCustomer
    if (differentiator) row.differentiator = differentiator
    if (ip) row.ip_address = ip

    // Try with all columns first, fall back without optional ones
    let { data: demo, error } = await admin
      .from('demo_requests')
      .insert(row)
      .select()
      .single()

    if (error?.message?.includes('column')) {
      // Retry without optional columns that may not exist
      const { data: d2, error: e2 } = await admin
        .from('demo_requests')
        .insert({ name, email: email.toLowerCase().trim(), phone: phone || null, website, status: 'pending' })
        .select()
        .single()
      demo = d2
      error = e2
    }

    if (error) throw error

    // Fire pipeline in background — don't await
    // Use request origin for internal calls (avoids port mismatch in dev)
    const origin = request.headers.get('origin') || request.headers.get('host') ? `http://${request.headers.get('host')}` : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${origin}/api/demo/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoId: demo.id }),
    }).catch(err => console.error('demo/generate fire failed:', err))

    return NextResponse.json({ success: true, demoId: demo.id })
  } catch (err) {
    console.error('demo/start error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
