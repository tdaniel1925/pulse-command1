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

    const { data: demo, error } = await admin
      .from('demo_requests')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        website,
        top_service: topService || null,
        ideal_customer: idealCustomer || null,
        differentiator: differentiator || null,
        ip_address: ip,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Fire pipeline in background — don't await
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${baseUrl}/api/demo/generate`, {
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
