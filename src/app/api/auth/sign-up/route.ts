import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

interface SignUpBody {
  email: string
  password: string
  firstName: string
  lastName: string
  businessName?: string
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SignUpBody = await request.json()
    const { email, password, firstName, lastName, businessName, phone } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
    })

    if (authError || !authData.user) {
      console.error('Auth signup error:', authError)
      return NextResponse.json(
        { error: authError?.message ?? 'Failed to create account' },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // Create brand profile
    const { data: brandProfile, error: brandProfileError } = await supabase
      .from('brand_profiles')
      .insert({ business_name: businessName ?? null })
      .select('id')
      .single()

    if (brandProfileError) {
      console.error('Error creating brand profile:', brandProfileError)
      return NextResponse.json({ error: 'Failed to create brand profile' }, { status: 500 })
    }

    // Insert client record linked to auth user
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        business_name: businessName ?? null,
        phone: phone ?? null,
        brand_profile_id: brandProfile.id,
        subscription_status: 'pending',
        onboarding_step: 'not_started',
      })
      .select('id')
      .single()

    if (clientError) {
      console.error('Error creating client record:', clientError)
      return NextResponse.json({ error: 'Failed to create client profile' }, { status: 500 })
    }

    // TODO: create Stripe customer
    // const stripeCustomer = await stripe.customers.create({ email, name: `${firstName} ${lastName}` })
    // await supabase.from('clients').update({ stripe_customer_id: stripeCustomer.id }).eq('id', client.id)
    console.log('TODO: Create Stripe customer for user:', userId)

    // Fetch generated onboarding_pin and send welcome email
    const { data: newClient } = await supabase
      .from('clients')
      .select('id, onboarding_pin')
      .eq('user_id', authData.user!.id)
      .single()

    if (newClient) {
      await sendWelcomeEmail({
        to: email,
        firstName,
        businessName: businessName ?? '',
        pin: newClient.onboarding_pin,
      }).catch(err => console.error('Welcome email failed:', err))
    }

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error('POST /api/auth/sign-up error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
