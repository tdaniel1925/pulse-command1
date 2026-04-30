import Stripe from 'stripe'

// Returns null if STRIPE_SECRET_KEY not set — callers must handle null
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia' as any,
  })
}

// Pricing plans — update price IDs when Stripe is configured
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER ?? 'price_starter_placeholder',
    description: 'Perfect for small businesses getting started',
    features: [
      '4 social posts per month',
      '1 AI presentation',
      'Email support',
      'Basic analytics',
      'Ayrshare social publishing',
    ],
    highlight: false,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 149,
    priceId: process.env.STRIPE_PRICE_GROWTH ?? 'price_growth_placeholder',
    description: 'For businesses ready to scale their content',
    features: [
      '16 social posts per month',
      'Unlimited presentations',
      'Priority support',
      'Advanced analytics',
      'AI video generation',
      'Newsletter (up to 1,000 subscribers)',
      'Lead magnet hosting',
    ],
    highlight: true, // most popular
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 399,
    priceId: process.env.STRIPE_PRICE_AGENCY ?? 'price_agency_placeholder',
    description: 'For agencies managing multiple clients',
    features: [
      'Everything in Growth',
      'Unlimited social posts',
      'White-label reports',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited newsletter subscribers',
      'API access',
    ],
    highlight: false,
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlan(planId: string): typeof PLANS[PlanId] | null {
  return PLANS[planId as PlanId] ?? null
}
