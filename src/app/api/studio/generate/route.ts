export const maxDuration = 60
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateJSON, DEFAULT_MODEL } from '@/lib/openrouter'
import { normalizeKitContent, KIT_LIMITS, type KitContent } from '@/lib/studio/kit-schema'
import { deriveThemeFromBrand, type ThemeProps } from '@/lib/studio/theme'
import { composeLayout } from '@/components/studio/blocks/registry'

/**
 * Studio AI fill — turns a plain-language goal + the client's brand into a fully
 * populated KitContent and a derived theme. The AI only produces CONTENT; the
 * theme is derived deterministically from the brand color, and lengths are
 * clamped by normalizeKitContent — so the result is always renderable and good.
 */
export async function POST(request: NextRequest) {
  try {
    const { goal } = (await request.json()) as { goal?: string }
    if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
      return NextResponse.json({ error: 'Please describe the page goal.' }, { status: 400 })
    }

    // Auth + resolve the caller's client + brand profile.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: client } = await admin
      .from('clients')
      .select('id, business_name')
      .eq('user_id', user.id)
      .single()
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const { data: bp } = await admin
      .from('brand_profiles')
      .select('primary_color, secondary_color, business_description, target_audience, tone_of_voice, logo_url')
      .eq('client_id', client.id)
      .single()

    const businessName = client.business_name ?? 'Your Business'
    const tone = bp?.tone_of_voice ?? 'professional and friendly'

    // 1. Generate the page CONTENT (not design) as structured JSON.
    let raw: unknown = {}
    try {
      raw = await generateJSON({
        model: DEFAULT_MODEL,
        maxTokens: 3500, // full page (stats/pricing/faq/team) needs room or JSON truncates
        prompt: `You are an expert conversion copywriter. Write the CONTENT for a single
landing page. Return ONLY JSON matching this exact shape — no design, no HTML, just text.

BUSINESS: ${businessName}
WHAT THEY DO: ${bp?.business_description ?? ''}
AUDIENCE: ${bp?.target_audience ?? 'small businesses'}
TONE: ${tone}
PAGE GOAL (from the user): ${goal.trim()}

Rules:
- Headlines <= ${KIT_LIMITS.headline} chars. Subheads <= ${KIT_LIMITS.subhead} chars.
- Exactly 3 features, each title <= ${KIT_LIMITS.featureTitle} chars, body <= ${KIT_LIMITS.featureBody} chars.
- 3 short testimonials (realistic, first-name + last-initial author). Quote <= ${KIT_LIMITS.quote} chars.
- Punchy CTA button labels <= ${KIT_LIMITS.cta} chars.
- 3-4 stats: a short value (e.g. "500+", "24/7", "15 yrs") + a label. Make them believable for this business.
- 3 pricing tiers (or omit pricing entirely if this business clearly doesn't sell tiered plans). Each: name, price (e.g. "$0", "$49/mo", "Custom"), short blurb, 3-5 feature bullets, a cta label. Mark the middle/best tier "highlighted": true.
- 4-5 FAQ items: a real question a customer of THIS business would ask + a concise answer (<= ${KIT_LIMITS.faqA} chars).
- 3-4 team members with realistic name + role (omit team if not relevant).
- Write specifically for THIS business and goal — no lorem, no placeholders. Omit any optional section that genuinely doesn't fit (return it as null or leave it out).

JSON shape (optional sections may be omitted/null when they don't fit the business):
{
  "brandName": "string",
  "hero": { "eyebrow": "short label", "headline": "string", "subhead": "string", "ctaPrimary": "string", "ctaSecondary": "string", "image": { "alt": "describe an ideal hero image" } },
  "features": { "heading": "string", "subhead": "string", "items": [ { "title": "string", "body": "string" } ] },
  "showcase": { "heading": "string", "body": "string", "image": { "alt": "describe an ideal showcase image" } },
  "testimonials": { "heading": "string", "items": [ { "quote": "string", "author": "string" } ] },
  "cta": { "headline": "string", "subhead": "string", "button": "string" },
  "stats": [ { "value": "string", "label": "string" } ],
  "pricing": { "heading": "string", "subhead": "string", "tiers": [ { "name": "string", "price": "string", "blurb": "string", "features": ["string"], "cta": "string", "highlighted": false } ] },
  "faq": { "heading": "string", "items": [ { "q": "string", "a": "string" } ] },
  "team": { "heading": "string", "members": [ { "name": "string", "role": "string" } ] }
}`,
      })
    } catch (err) {
      console.error('[studio/generate] AI generation failed:', err)
      return NextResponse.json({ error: 'Content generation failed. Please try again.' }, { status: 502 })
    }

    const content: KitContent = normalizeKitContent(raw, businessName)

    // 2. Do NOT generate Gemini images inline — each takes ~10-15s and would push
    //    this request past Vercel's function timeout (10s Hobby / 60s Pro) → 502.
    //    Seed the hero with the brand logo so the page is renderable immediately,
    //    and let the client fill images progressively via /api/studio/regenerate-image
    //    after the preview shows. (The slot `alt` text drives those calls.)
    content.hero.image.src = bp?.logo_url ?? null
    content.showcase.image.src = null

    // 3. Derive the theme deterministically from the brand color (always valid).
    const theme: ThemeProps = deriveThemeFromBrand({ accent: bp?.primary_color ?? null })

    // 4. Compose the page layout from the content the AI actually produced —
    //    different brands get different (but always valid) block orders.
    const layout = composeLayout(content)

    return NextResponse.json({ content, theme, layout })
  } catch (err) {
    console.error('[studio/generate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
