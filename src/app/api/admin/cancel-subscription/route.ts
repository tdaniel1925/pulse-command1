export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'
import { getStripe } from '@/lib/stripe'

/**
 * Admin-only: cancel a client's Stripe subscription. By default cancels at the
 * end of the current period (client keeps access until then); pass
 * immediately:true to cancel now. The webhook (customer.subscription.deleted /
 * updated) reconciles subscription_status when Stripe processes it; we also set
 * it locally for immediate admin feedback.
 *
 * body: { clientId: string, immediately?: boolean }
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.response) return gate.response

  try {
    const stripe = getStripe()
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

    const { clientId, immediately } = (await req.json()) as { clientId?: string; immediately?: boolean }
    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

    const admin = createAdminClient()
    const { data: client } = await admin
      .from('clients')
      .select('id, stripe_subscription_id, stripe_customer_id')
      .eq('id', clientId)
      .single()
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Resolve the subscription id (fall back to looking it up by customer).
    let subId = client.stripe_subscription_id as string | null
    if (!subId && client.stripe_customer_id) {
      const subs = await stripe.subscriptions.list({ customer: client.stripe_customer_id as string, status: 'all', limit: 1 })
      subId = subs.data[0]?.id ?? null
    }
    if (!subId) {
      return NextResponse.json({ error: 'No active subscription found for this client' }, { status: 400 })
    }

    if (immediately) {
      await stripe.subscriptions.cancel(subId)
      await admin.from('clients').update({ subscription_status: 'cancelled' }).eq('id', client.id)
    } else {
      await stripe.subscriptions.update(subId, { cancel_at_period_end: true })
      // Keep status as-is until the period ends; the webhook flips it on deletion.
    }

    await admin.from('activities').insert({
      client_id: client.id,
      type: 'billing',
      title: immediately ? 'Subscription cancelled (immediate)' : 'Subscription set to cancel at period end',
      description: 'Cancelled by admin.',
      created_by: 'admin',
    } as never)

    return NextResponse.json({ ok: true, mode: immediately ? 'immediate' : 'period_end' })
  } catch (err) {
    console.error('[admin/cancel-subscription]', err)
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
