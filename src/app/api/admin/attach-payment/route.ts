export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'
import { getStripe, getPlan, PUBLIC_PLAN } from '@/lib/stripe'

/**
 * Admin-only: after the admin enters a client's card via Stripe Elements (MOTO),
 * the SetupIntent succeeds and returns a payment_method id. This endpoint sets
 * that as the customer's default and starts the subscription. The raw card was
 * tokenized client-side by Stripe — we only ever see the payment_method id.
 *
 * body: { clientId: string, paymentMethodId: string, planId?: string }
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.response) return gate.response

  try {
    const stripe = getStripe()
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

    const { clientId, paymentMethodId, planId } = (await req.json()) as {
      clientId?: string; paymentMethodId?: string; planId?: string
    }
    if (!clientId || !paymentMethodId) {
      return NextResponse.json({ error: 'clientId and paymentMethodId are required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: client } = await admin
      .from('clients')
      .select('id, stripe_customer_id')
      .eq('id', clientId)
      .single()
    if (!client?.stripe_customer_id) {
      return NextResponse.json({ error: 'Client has no Stripe customer' }, { status: 400 })
    }

    const plan = (planId && getPlan(planId)) || PUBLIC_PLAN

    // Set the entered card as the default payment method.
    await stripe.paymentMethods.attach(paymentMethodId, { customer: client.stripe_customer_id }).catch(() => {})
    await stripe.customers.update(client.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Start the subscription on the card.
    const subscription = await stripe.subscriptions.create({
      customer: client.stripe_customer_id,
      items: [{ price: plan.priceId }],
      default_payment_method: paymentMethodId,
      metadata: { clientId: client.id, planId: plan.id },
    })

    await admin
      .from('clients')
      .update({
        subscription_status: 'active',
        plan_name: plan.id,
        stripe_subscription_id: subscription.id,
      })
      .eq('id', client.id)

    return NextResponse.json({ ok: true, subscriptionId: subscription.id })
  } catch (err) {
    console.error('[admin/attach-payment]', err)
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
