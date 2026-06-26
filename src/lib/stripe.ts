import Stripe from 'stripe'

// Returns null if STRIPE_SECRET_KEY not set — callers must handle null
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })
}

// Pricing — single product: do one interview, and we post to your social
// accounts automatically for $149/month. Set the real Stripe price ID via
// STRIPE_PRICE_STARTER; the placeholder lets the app build without Stripe.
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Auto Social',
    price: 149,
    priceId: process.env.STRIPE_PRICE_STARTER ?? 'price_starter_placeholder',
    description: 'One interview. We post to your socials automatically.',
    features: [
      'A quick one-time interview about your business',
      '30 on-brand social posts/month',
      'AI image with every post',
      'Auto-published to your connected accounts — no approvals needed',
    ],
    // Entitlements consumed by the post-generation loop + app gating.
    entitlements: {
      socialPostsPerMonth: 30,
      landingPagesPerMonth: 0,
    },
    highlight: true,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 399,
    priceId: process.env.STRIPE_PRICE_GROWTH ?? 'price_growth_placeholder',
    description: 'The agency replacement for growing businesses',
    features: [
      '100 social posts/month',
      'AI image with every post',
      'Auto-publish across all platforms',
      '3 landing pages',
      'Priority generation',
    ],
    entitlements: {
      socialPostsPerMonth: 100,
      landingPagesPerMonth: 3,
    },
    highlight: true, // most popular
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 749,
    priceId: process.env.STRIPE_PRICE_PRO ?? 'price_pro_placeholder',
    description: 'High-volume content for established brands',
    features: [
      '300 social posts/month',
      'AI image with every post',
      'Auto-publish across all platforms',
      'Unlimited landing pages',
      'Priority generation',
    ],
    entitlements: {
      socialPostsPerMonth: 300,
      landingPagesPerMonth: -1, // unlimited
    },
    highlight: false,
  },
} as const

export type PlanId = keyof typeof PLANS
export type Plan = typeof PLANS[PlanId]

export function getPlan(planId: string): Plan | null {
  return PLANS[planId as PlanId] ?? null
}
