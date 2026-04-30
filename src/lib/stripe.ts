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
    description: 'Perfect for testing',
    features: [
      '20 social posts/month',
      'Basic analytics',
      'Email support',
    ],
    highlight: false,
  },
  essential: {
    id: 'essential',
    name: 'Essential',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ESSENTIAL ?? 'price_essential_placeholder',
    description: 'For growing brands',
    features: [
      '50 social posts/month',
      '2 videos/month',
      'Advanced analytics',
      'Priority support',
    ],
    highlight: false,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 149,
    priceId: process.env.STRIPE_PRICE_GROWTH ?? 'price_growth_placeholder',
    description: 'Most popular',
    features: [
      '100 social posts/month',
      '5 videos/month',
      '✓ Whitepaper',
      '✓ Articles (5)',
      '✓ Tweet Threads (20)',
      '✓ Infographics (8)',
      '✓ Case Studies (4)',
      'Dedicated manager',
    ],
    highlight: true, // most popular
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 399,
    priceId: process.env.STRIPE_PRICE_AGENCY ?? 'price_agency_placeholder',
    description: 'For teams & agencies',
    features: [
      'Unlimited posts/videos',
      'All content types',
      'Email sequences',
      'Podcast generation',
      'Team collaboration',
      'Custom integrations',
      'White-label options',
    ],
    highlight: false,
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlan(planId: string): typeof PLANS[PlanId] | null {
  return PLANS[planId as PlanId] ?? null
}
