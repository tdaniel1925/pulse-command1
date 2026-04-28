import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // Verify caller is an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const isAdmin = user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'super_admin'
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const admin = createAdminClient()
    const { data: clients, error } = await admin
      .from('clients')
      .select('id, first_name, last_name, email, business_name, status, onboarding_step, subscription_status, assigned_to, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    return NextResponse.json(clients)
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Accept both camelCase (legacy) and snake_case (modal)
    const first_name = body.first_name ?? body.firstName ?? ''
    const last_name = body.last_name ?? body.lastName ?? ''
    const email = body.email ?? ''
    const business_name = body.business_name ?? body.businessName ?? null
    const phone = body.phone ?? null
    const website = body.website ?? null
    const industry = body.industry ?? null
    const status = body.status ?? 'lead'
    const assigned_to = body.assigned_to ?? null

    if (!first_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: first_name, email' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Create brand profile first
    const { data: brandProfile, error: brandProfileError } = await admin
      .from('brand_profiles')
      .insert({ business_name: business_name ?? null })
      .select('id')
      .single()

    if (brandProfileError) {
      console.error('Error creating brand profile:', brandProfileError)
      return NextResponse.json({ error: 'Failed to create brand profile' }, { status: 500 })
    }

    // Insert client record
    const { data: client, error: clientError } = await admin
      .from('clients')
      .insert({
        first_name,
        last_name: last_name || null,
        email,
        business_name,
        phone,
        website,
        industry,
        status,
        assigned_to,
        brand_profile_id: brandProfile.id,
        subscription_status: 'pending',
        onboarding_step: 'signed_up',
      })
      .select('*')
      .single()

    if (clientError) {
      console.error('Error creating client:', clientError)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
