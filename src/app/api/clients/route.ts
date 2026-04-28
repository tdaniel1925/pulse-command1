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
    const { firstName, lastName, email, businessName, phone } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create brand profile first
    const { data: brandProfile, error: brandProfileError } = await supabase
      .from('brand_profiles')
      .insert({ business_name: businessName ?? null })
      .select('id')
      .single()

    if (brandProfileError) {
      console.error('Error creating brand profile:', brandProfileError)
      return NextResponse.json({ error: 'Failed to create brand profile' }, { status: 500 })
    }

    // Insert client record linked to brand profile
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        business_name: businessName ?? null,
        phone: phone ?? null,
        brand_profile_id: brandProfile.id,
        subscription_status: 'pending',
        onboarding_step: 'not_started',
      })
      .select('*')
      .single()

    if (clientError) {
      console.error('Error creating client:', clientError)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }

    // TODO: send welcome email via Resend
    // await resend.emails.send({ to: email, subject: 'Welcome to PulseFlow', ... })
    console.log('TODO: Send welcome email via Resend to:', email)

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
