# BundledContent — Packages & Pricing (grounded in what the app can deliver)

> Status note: pricing here is built around what the code can **actually deliver today** plus
> realistic per-customer API cost. Volume promises (150 posts etc.) are still 1-per-call in
> code — see "Reality check" at the end. Don't print a tier publicly until its volume is enforced.

---

## 1. What it actually costs to serve one customer / month

Rough per-customer variable cost (the AI/API bill), based on the integrations in the codebase:

| Cost driver | Provider | ~Unit cost | Notes |
|---|---|---|---|
| Social post text | OpenRouter free → **Anthropic paid fallback** | ~$0.001–0.01 / post | Free slugs rotate; assume you pay Anthropic for many. Budget as if paid. |
| Social post image | Google Gemini (nano_banana) | ~$0.02–0.04 / image | One per post if images are on. |
| Short video (avatar) | AutoContent | **$$ high** — ~$1–4 / video | Biggest cost. Confirm your AutoContent plan's per-render price. |
| Podcast episode | AutoContent | **$$ high** — ~$1–5 / episode | Per-minute pricing; a long episode is your single most expensive item. |
| Publishing | Ayrshare | ~$0 marginal | Per-profile subscription, not per-post. Factor the seat cost. |
| Phone interview | VAPI | ~$0.05–0.15 / min | One-time at onboarding, not monthly. |
| Email / SMS | Resend / Twilio | cents | Negligible. |

**Cost shape:** text+images are cheap and scale linearly; **video and podcast dominate.**
Your margin is decided almost entirely by how many videos/podcasts a tier includes.

### Ballpark monthly cost per tier (variable only, excludes Ayrshare seat + your labor)
- **30 posts + 1 video + ~1 podcast** ≈ $1.50 (text) + $1 (images) + $3 (video) + $4 (podcast) ≈ **~$9–12**
- **150 posts + 4 videos + 2 podcasts** ≈ $7 + $5 + $14 + $9 ≈ **~$35–50**

So the current **Lite $99** and **Full $745** both have healthy gross margin *if* the volumes are
real. Full at $745 against ~$50 cost is ~93% gross margin — generous, room to compete on price.

---

## 2. Recommended package structure

The current 3 tiers are sound but the **$99 → $745 gap is too wide** (7.5×). Most prospects
will balk at $745 and there's nothing to catch them. Add a middle tier.

### Tier A — **Starter** $149/mo  *(rename of "Lite", repriced up)*
For solo operators / very small businesses testing the water.
- 30 social posts/mo (text + AI image) across connected platforms
- 1 AI video short/mo
- 1 podcast episode/mo
- Auto-publishing to their connected accounts
- ❌ no performance report, no strategy call
- **Cost ~$10 → ~93% margin**

### Tier B — **Growth** $399/mo  *(NEW middle tier — the one most will buy)*
The "real agency replacement at SMB price" sweet spot.
- 75 social posts/mo
- 2 video shorts/mo
- 2 podcast episodes/mo
- Monthly performance report (real Ayrshare analytics)
- Quarterly strategy refresh
- **Cost ~$25 → ~94% margin**

### Tier C — **Full** $745/mo  *(keep)*
Full content operation on autopilot.
- 150 social posts/mo
- 4 video shorts/mo
- 2 podcast episodes/mo
- Monthly report + content strategy
- Priority generation
- **Cost ~$45 → ~94% margin**

### Tier D — **Premium / Agency** Custom (from $1,500/mo)
- Everything in Full, higher volumes
- Monthly strategy calls
- Reputation management (once OAuth is built)
- Multi-brand / white-label

> **Anchor effect:** showing a Custom/Premium tier makes Full look like the "value" choice.
> Keep it on the page even while it's quote-only.

---

## 3. Add-ons (one-time + recurring) — already in the product

These match `APP_OVERVIEW.md` and existing addon plumbing. Keep them; they're high-margin upsells.

| Add-on | Suggested price | Type | Status in code |
|---|---|---|---|
| Extra video short | $49 | one-time | video pipeline works |
| Extra 10 social posts | $29 | one-time | text+image works |
| Email newsletter | $149/mo | recurring | generation works (hidden in nav) |
| Google Business posts | $49/mo | recurring | publishing works via Ayrshare |
| AI landing page | $199 | one-time | ⚠️ deploy doesn't go "live" yet |
| Lead magnet PDF | $149 | one-time | PDF generation works (hidden in nav) |
| Reputation management | $99/mo | recurring | ⚠️ needs OAuth flow first |

**Don't sell** Landing Page or Reputation as add-ons until their gaps are closed (marked ⚠️).

---

## 4. Pricing psychology / packaging moves

1. **Annual discount** — offer "2 months free" on annual (≈17% off). Improves cash flow + retention.
2. **14-day free trial** — the sign-up page already says "first charge after 14-day trial." Keep it; it's your conversion lever vs. a $10k agency.
3. **Founding-customer pricing** — lock early customers at a lower rate for life; great for testimonials while volume isn't fully built.
4. **Position against the agency, not against tools** — the whole pitch is "replaces a $10k/mo agency for <$750." Lead with that contrast on every tier.
5. **Per-tier "what's included" must match entitlements in code** — keep `stripe.ts` entitlements and the marketing page in lockstep so you never promise what you can't gate.

---

## 5. Reality check before publishing these numbers ⚠️

The pricing above assumes the volumes are **real**. Today the code generates **1 of each per
run**, not 30/75/150. Before advertising a tier publicly:

- [ ] Enforce the post/video/podcast counts per tier (loop the generators; finish the
      Predis-or-equivalent path for bulk social).
- [ ] Confirm your **actual AutoContent per-render price** — it's the one number that can flip a
      tier from 90%+ margin to a loss. Re-run the cost table with real figures.
- [ ] Confirm OpenRouter free slugs work, else every text gen is paid Anthropic (still cheap, but
      budget it).
- [ ] Gate features by `entitlements` so a Starter customer can't trigger Full-tier volume.

**Bottom line:** the margins support aggressive pricing — your constraint isn't cost, it's
**delivering the promised volume reliably.** Price for the value ($10k agency replacement), not
for the API cost.
