import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 403 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client || !client.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id as string,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[stripe/create-portal]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
