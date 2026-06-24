# Overhaul: Social Posting + Landing Pages — Notes & Delete List

The app was refocused to TWO products: **AI social posting** and **landing page creation**.
Everything else is **hidden, not deleted** (reversible). Build/lint/types are all green (0/0/0).

---

## What changed (live now)

- **Nav** (`DashboardNav.tsx`) shows only: Dashboard, Social Posts, Landing Pages, Upload, Settings, Billing.
- **Demo** results show posts only (no podcast/video tabs or upsell rows).
- **Onboarding** is now: welcome → brand-assets (website scan auto-fills brand) → complete. No VAPI phone call.
- **Monthly pipeline** generates the **real per-tier post quota** (idempotent, throttled, varied topics) via Gemini + OpenRouter + Ayrshare. Predis path no longer used by the pipeline.
- **Landing pages** publish instantly to `/p/[slug]` on your own domain (HTML stored in Supabase, XSS-escaped, visit counter). No GitHub/Vercel deploy.
- **Pricing** is now Starter $149 / Growth $399 / Pro $749, scaled by posts/month + landing pages.

---

## ⚠️ ACTION REQUIRED — env vars (Stripe price IDs renamed!)

The plan IDs changed, so the price-ID env vars changed. Update `.env.local`:

| Old (remove) | New (add) |
|---|---|
| `STRIPE_PRICE_LITE` | `STRIPE_PRICE_STARTER` |
| `STRIPE_PRICE_FULL` | `STRIPE_PRICE_GROWTH` |
| `STRIPE_PRICE_PREMIUM` | `STRIPE_PRICE_PRO` |

You'll need 3 matching **Stripe products/prices** ($149 / $399 / $749). Also still need:
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`.

## ⚠️ ACTION REQUIRED — run migrations
- `supabase/migrations/landing_pages_hosting.sql` (adds slug/html/status + visit RPC for in-app pages)

---

## ✅ DELETE LIST EXECUTED (54 paths removed, build green)

The features below were DELETED (not just hidden). Cross-references were repointed first:
- `demo/generate` → posts-only (audio/video generation removed)
- `demo/verify` → no longer fires render-video
- `strategy/approve` → now calls `generateMonthlyPostsForClient` in-process
- `admin/ClientActions` → now triggers `/api/pipeline/monthly`
- `deliver-client` → social-only (podcast/video script generation + newsletter line removed)

Also added: **landing-page entitlement gate** in `deploy-page` — publishing a new page
is blocked when the plan's `landingPagesPerMonth` quota is reached (-1 = unlimited).

### (Original delete list — now removed)

### Onboarding (replaced by web form + scrape)
- `src/app/onboarding/choose-avatar/` (page)
- `src/app/onboarding/choose-voice/` (page)
- `src/app/onboarding/interview/` (page)
- `src/app/api/onboarding/save-selection/` (avatar/voice save)
- `src/app/api/onboarding/send-interview-reminder/`
- `src/app/api/onboarding/pin/` (phone/PIN — only used for VAPI)
- `src/app/api/webhooks/vapi/` + `src/app/api/pipeline/analyze-transcript/` (phone interview chain)

### Audio / video / podcast
- `src/app/dashboard/audio/`, `src/app/dashboard/videos/` (pages)
- `src/app/api/pipeline/render-audio/`, `submit-heygen/`, `create-audiogram/`
- `src/app/api/videos/`, `src/app/api/content/video/`, `src/app/api/webhooks/heygen/`
- `src/lib/autocontent.ts`, `src/lib/heygen.ts`, `src/app/api/admin/cost-probe/` (AutoContent probe)
- `src/app/api/heygen/`, `src/app/api/admin/clients/[id]/link-heygen-video/`

### Newsletter / lead magnets / presentations / reputation / reports
- `src/app/dashboard/{newsletter,lead-magnet,presentations,reputation,report}/`
- `src/app/api/newsletter/`, `src/app/api/lead-magnets/`, `src/app/api/presentations/`
- `src/app/api/pipeline/{send-newsletter,generate-lead-magnet,reports,generate-brief}/`
- `src/app/api/integrations/` (reputation, google/yelp reviews)
- `src/lib/pdf-strategy.ts`, `src/lib/presentation-templates.ts`, `src/components/pdf/`, `src/components/dashboard/charts/`, `src/components/dashboard/SlideRenderer.tsx`, `PresentationViewer.tsx`

### Retired social path (Predis)
- `src/app/api/pipeline/generate-content/` (Predis) and `src/app/api/webhooks/predis/`
  — superseded by `generate-monthly-posts.ts`

> NOTE: some of these touch shared DB columns (e.g. `presentations_limit`). Deleting the
> code is safe; leave the columns unless you also want a DB cleanup migration.

---

## Still TODO for full launch
- [ ] Create the 3 Stripe products + set the new env price IDs.
- [ ] Run the landing-pages migration.
- [ ] Confirm OpenRouter free model slugs (else text gen silently uses paid Anthropic — now logged).
- [ ] Soften any public marketing pages (`/`, `/pricing`, `/samples`) that still advertise videos/podcasts.
- [ ] Gate landing-page creation by the `landingPagesPerMonth` entitlement (enforcement not yet wired in the create flow).
