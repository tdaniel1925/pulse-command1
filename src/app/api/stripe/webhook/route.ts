export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 403 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const clientId = session.metadata?.clientId
        const planId = session.metadata?.planId
        if (!clientId || !planId) break

        const presentationsLimit = planId === 'growth' || planId === 'agency' ? 999 : 1
        await admin
          .from('clients')
          .update({
            plan_name: planId,
            plan_status: 'active',
            stripe_subscription_id: session.subscription,
            presentations_limit: presentationsLimit,
          })
          .eq('id', clientId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customerId = subscription.customer
        await admin
          .from('clients')
          .update({
            plan_status: subscription.status,
            plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        await admin
          .from('clients')
          .update({
            plan_status: 'canceled',
            plan_name: 'free',
            presentations_limit: 1,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const customerId = invoice.customer
        await admin
          .from('clients')
          .update({ plan_status: 'past_due' })
          .eq('stripe_customer_id', customerId)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error', err)
    // Don't return 400 — Stripe will retry. Log and return 200.
  }

  return NextResponse.json({ received: true })
}
