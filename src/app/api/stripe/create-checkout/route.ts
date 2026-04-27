import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, businessName } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Create or retrieve Stripe customer
    const customers = await getStripe().customers.list({ email, limit: 1 })
    let customer = customers.data[0]

    if (!customer) {
      customer = await getStripe().customers.create({
        email,
        name: `${firstName} ${lastName}`,
        metadata: { businessName },
      })
    }

    // Create checkout session with 14-day trial
    const session = await getStripe().checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { businessName },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('create-checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
