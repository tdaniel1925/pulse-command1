import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // TODO: use service role client for webhooks
    // For now using anon client — replace with service role for production
    const supabase = await createClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('checkout.session.completed:', session.id)

        // TODO: implement — look up client by stripe_customer_id and update
        const { error } = await supabase
          .from('clients')
          .update({ subscription_status: 'active' })
          .eq('stripe_customer_id', session.customer)

        if (error) console.error('Error updating client subscription:', error)

        await supabase.from('activities').insert({
          type: 'billing',
          title: 'Subscription activated',
          description: `Checkout session ${session.id} completed`,
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('customer.subscription.updated:', subscription.id)

        // TODO: implement — update subscription record in DB
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('customer.subscription.deleted:', subscription.id)

        // TODO: implement — find client by stripe_customer_id
        await supabase
          .from('clients')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_customer_id', subscription.customer)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('invoice.payment_failed:', invoice.id)

        // TODO: implement — find client by stripe_customer_id
        await supabase
          .from('clients')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer)

        await supabase.from('activities').insert({
          type: 'billing',
          title: 'Payment failed',
          description: `Invoice ${invoice.id} payment failed`,
        })
        break
      }

      default:
        console.log('Unhandled Stripe event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
