/**
 * Kit content schema — the contract the AI fills and the kit renders.
 *
 * The AI never produces layout or styling; it only produces this structured
 * content. Sections read it and render within the design bible, so output is
 * always on-brand and well-composed regardless of what the AI writes.
 *
 * Lengths are intentionally bounded so a too-long headline can't break a layout —
 * the schema itself is part of the "can't make it ugly" guarantee.
 */

export interface KitImage {
  /** Resolved at generation time: brand asset, Gemini image, or null (placeholder). */
  src?: string | null
  alt?: string
}

export interface FeatureItem {
  title: string
  body: string
}

export interface Testimonial {
  quote: string
  author: string
}

export interface StatItem {
  value: string // e.g. "12,000+", "99.9%"
  label: string
}

export interface PricingTier {
  name: string
  price: string // e.g. "$0", "$29/mo"
  blurb?: string
  features: string[]
  cta: string
  highlighted?: boolean
}

export interface FaqItem {
  q: string
  a: string
}

export interface TeamMember {
  name: string
  role: string
}

export interface KitContent {
  /** Brand/business name shown in the nav + footer. */
  brandName: string

  hero: {
    eyebrow?: string // small label above headline, e.g. "New"
    headline: string
    subhead: string
    ctaPrimary: string
    ctaSecondary?: string
    image: KitImage
  }

  features: {
    heading: string
    subhead?: string
    items: FeatureItem[] // render up to 3 (a clean trio)
  }

  showcase: {
    heading: string
    body: string
    image: KitImage
  }

  testimonials: {
    heading?: string
    items: Testimonial[] // render up to 3
  }

  cta: {
    headline: string
    subhead?: string
    button: string
  }

  // Optional sections — when absent, kits fall back to their original copy.
  stats?: StatItem[]
  pricing?: { heading?: string; subhead?: string; tiers: PricingTier[] }
  faq?: { heading?: string; items: FaqItem[] }
  team?: { heading?: string; members: TeamMember[] }
}

/** Length caps enforced when validating AI output (prevents layout-breaking copy). */
export const KIT_LIMITS = {
  headline: 70,
  subhead: 180,
  eyebrow: 28,
  cta: 28,
  featureTitle: 40,
  featureBody: 120,
  quote: 200,
  author: 48,
  statValue: 16,
  statLabel: 40,
  tierName: 24,
  tierPrice: 20,
  tierBlurb: 80,
  tierFeature: 60,
  faqQ: 100,
  faqA: 260,
  memberName: 40,
  memberRole: 48,
  maxFeatures: 3,
  maxTestimonials: 3,
  maxStats: 4,
  maxTiers: 3,
  maxTierFeatures: 6,
  maxFaq: 6,
  maxTeam: 4,
} as const

/** Clamp + shape raw AI JSON into a safe KitContent. Never throws. */
export function normalizeKitContent(raw: unknown, fallbackBrand = 'Your Business'): KitContent {
  const r = (raw ?? {}) as Record<string, unknown>
  const s = (v: unknown, max: number, fallback = ''): string => {
    const str = typeof v === 'string' ? v.trim() : ''
    return (str || fallback).slice(0, max)
  }
  const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})
  // Preserve an already-resolved image URL (e.g. a generated Gemini image) but
  // only if it's a plausible http(s) or data URL — never trust arbitrary strings.
  const imgSrc = (v: unknown): string | null => {
    const o = obj(v)
    const src = typeof o.src === 'string' ? o.src : ''
    return /^(https?:\/\/|data:image\/)/.test(src) ? src : null
  }

  const hero = obj(r.hero)
  const features = obj(r.features)
  const showcase = obj(r.showcase)
  const testimonials = obj(r.testimonials)
  const cta = obj(r.cta)

  const featureItems = Array.isArray(features.items) ? features.items : []
  const testimonialItems = Array.isArray(testimonials.items) ? testimonials.items : []
  const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

  // Optional sections — parsed only when present; left undefined otherwise so the
  // kit components fall back to their byte-exact original copy.
  const statsRaw = arr(r.stats)
    .slice(0, KIT_LIMITS.maxStats)
    .map((it) => { const o = obj(it); return { value: s(o.value, KIT_LIMITS.statValue), label: s(o.label, KIT_LIMITS.statLabel) } })
    .filter((x) => x.value && x.label)
  const stats = statsRaw.length ? statsRaw : undefined

  const pricingObj = obj(r.pricing)
  const tiers = arr(pricingObj.tiers)
    .slice(0, KIT_LIMITS.maxTiers)
    .map((it) => {
      const o = obj(it)
      return {
        name: s(o.name, KIT_LIMITS.tierName, 'Plan'),
        price: s(o.price, KIT_LIMITS.tierPrice, '$0'),
        blurb: s(o.blurb, KIT_LIMITS.tierBlurb) || undefined,
        features: arr(o.features).slice(0, KIT_LIMITS.maxTierFeatures).map((ft) => s(ft, KIT_LIMITS.tierFeature)).filter(Boolean),
        cta: s(o.cta, KIT_LIMITS.cta, 'Get started'),
        highlighted: o.highlighted === true,
      }
    })
    .filter((x) => x.features.length)
  const pricing = tiers.length
    ? { heading: s(pricingObj.heading, KIT_LIMITS.headline) || undefined, subhead: s(pricingObj.subhead, KIT_LIMITS.subhead) || undefined, tiers }
    : undefined

  const faqObj = obj(r.faq)
  const faqItems = arr(faqObj.items)
    .slice(0, KIT_LIMITS.maxFaq)
    .map((it) => { const o = obj(it); return { q: s(o.q, KIT_LIMITS.faqQ), a: s(o.a, KIT_LIMITS.faqA) } })
    .filter((x) => x.q && x.a)
  const faq = faqItems.length
    ? { heading: s(faqObj.heading, KIT_LIMITS.headline) || undefined, items: faqItems }
    : undefined

  const teamObj = obj(r.team)
  const members = arr(teamObj.members)
    .slice(0, KIT_LIMITS.maxTeam)
    .map((it) => { const o = obj(it); return { name: s(o.name, KIT_LIMITS.memberName), role: s(o.role, KIT_LIMITS.memberRole) } })
    .filter((x) => x.name)
  const team = members.length
    ? { heading: s(teamObj.heading, KIT_LIMITS.headline) || undefined, members }
    : undefined

  return {
    brandName: s(r.brandName, 48, fallbackBrand),
    hero: {
      eyebrow: s(hero.eyebrow, KIT_LIMITS.eyebrow) || undefined,
      headline: s(hero.headline, KIT_LIMITS.headline, 'Welcome'),
      subhead: s(hero.subhead, KIT_LIMITS.subhead),
      ctaPrimary: s(hero.ctaPrimary, KIT_LIMITS.cta, 'Get started'),
      ctaSecondary: s(hero.ctaSecondary, KIT_LIMITS.cta) || undefined,
      image: { src: imgSrc(hero.image), alt: s((obj(hero.image)).alt, 80) },
    },
    features: {
      heading: s(features.heading, KIT_LIMITS.headline, 'What you get'),
      subhead: s(features.subhead, KIT_LIMITS.subhead) || undefined,
      items: featureItems.slice(0, KIT_LIMITS.maxFeatures).map((it) => {
        const o = obj(it)
        return { title: s(o.title, KIT_LIMITS.featureTitle, 'Feature'), body: s(o.body, KIT_LIMITS.featureBody) }
      }),
    },
    showcase: {
      heading: s(showcase.heading, KIT_LIMITS.headline, 'See it in action'),
      body: s(showcase.body, KIT_LIMITS.subhead),
      image: { src: imgSrc(showcase.image), alt: s((obj(showcase.image)).alt, 80) },
    },
    testimonials: {
      heading: s(testimonials.heading, KIT_LIMITS.headline) || undefined,
      items: testimonialItems.slice(0, KIT_LIMITS.maxTestimonials).map((it) => {
        const o = obj(it)
        return { quote: s(o.quote, KIT_LIMITS.quote, ''), author: s(o.author, KIT_LIMITS.author, '') }
      }).filter((t) => t.quote),
    },
    cta: {
      headline: s(cta.headline, KIT_LIMITS.headline, 'Ready to start?'),
      subhead: s(cta.subhead, KIT_LIMITS.subhead) || undefined,
      button: s(cta.button, KIT_LIMITS.cta, 'Get started'),
    },
    stats,
    pricing,
    faq,
    team,
  }
}
