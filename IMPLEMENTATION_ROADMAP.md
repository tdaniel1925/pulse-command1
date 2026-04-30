# PulseCommand Implementation Roadmap

## Phase 1: Monthly Content Automation ✓ (In Progress)

### Completed:
- [x] Cron job for monthly generation (`/api/cron/monthly-generation`)
- [x] Content generators for all 8 types:
  - Whitepaper (8-10 pages)
  - LinkedIn Articles (5x 1000-1500 word)
  - Tweet Threads (20x 5-10 tweet threads)
  - Infographics (8x detailed Gemini prompts)
  - Case Studies (4 fictional but realistic)
  - Email Sequences (3 sequences, 5 emails each)
  - Podcast Scripts (2 episodes, 45-60 min each)

### Todo:
- [ ] Add `monthly_content` table to Supabase schema
- [ ] Create dashboard page `/dashboard/monthly-content` to show generated content
- [ ] Batch approve/reject UI for monthly content
- [ ] Auto-publish to Ayrshare (all platforms)
- [ ] Track engagement metrics per content piece
- [ ] Set up Vercel Cron trigger (monthly at midnight)

---

## Phase 2: Updated Pricing Tiers

### New Pricing Model:

| Tier | Price | Posts/mo | Videos | Whitepaper | Articles | Tweets | Infographics | Case Studies | Emails | Podcasts |
|------|-------|----------|--------|-----------|----------|--------|--------------|--------------|--------|----------|
| Starter | $49 | 20 | — | — | — | — | — | — | — | — |
| Essential | $99 | 50 | 2 | — | — | — | — | — | — | — |
| Growth | $149 | 100 | 5 | ✓ | ✓ (5) | ✓ (20) | ✓ (8) | ✓ (4) | — | — |
| Agency | $399 | Unlimited | Unlimited | ✓ | ✓ (10) | ✓ (40) | ✓ (12) | ✓ (8) | ✓ | ✓ |

### Implementation:
- [ ] Update Stripe price IDs in `.env.local`
- [ ] Modify pricing page (`/pricing`)
- [ ] Update feature checks in code (which content types user can access)
- [ ] Add usage tracking (posts generated, videos made, etc.)
- [ ] Set up overage alerts

---

## Phase 3: Marketing Site Redesign

### Current State:
- Landing page at `/` is basic

### Needed:
- [ ] **Hero Section**: "The Operating System for Marketing Teams"
- [ ] **Problem Section**: "Content creation is broken"
- [ ] **Solution Section**: "One Interview → Monthly Marketing Plan"
- [ ] **Features Showcase**:
  - Brand Strategy Plan (illustration: strategy document with AI)
  - VAPI Interview (illustration: conversation with AI)
  - Multi-format Content (illustration: whitepaper + video + posts + email)
  - Monthly Automation (illustration: calendar with content flowing in)
  - Admin CRM (illustration: dashboard with clients)
  - Analytics (illustration: growth charts)
  
- [ ] **Pricing Section**: Show all 4 tiers with comparison table
- [ ] **Testimonials/Social Proof**: (Customer quotes once you have users)
- [ ] **FAQ**: Common questions about how it works
- [ ] **CTA**: "Start Free Trial" (or "$49/month")

### Nana AI Illustrations Needed:
1. Strategy document with AI thinking
2. Phone call with AI agent (VAPI)
3. Content explosion (multiple formats)
4. Calendar with automation
5. Dashboard with metrics
6. Team celebrating (showing team size reduction)

### Copy Focus:
"**PulseCommand is the AI marketing platform for solo founders and small teams. Generate 3 months of content in 15 minutes. One brand interview creates everything: strategy plan, posts, videos, emails, podcasts, and whitepapers.**"

---

## Phase 4: Deployment & Launch

### Pre-Launch Checklist:
- [ ] All Supabase migrations run
- [ ] Stripe keys configured in Vercel
- [ ] Cron job scheduled (Vercel or external)
- [ ] Email templates working (Resend)
- [ ] VAPI phone number live
- [ ] HeyGen avatar groups configured
- [ ] Ayrshare accounts linked
- [ ] Analytics tracking (Mixpanel/Segment)
- [ ] Error logging (Sentry)

### Post-Launch:
- [ ] Monitor cron job execution
- [ ] Track key metrics (signups, MRR, retention)
- [ ] Gather user feedback
- [ ] Iterate on content generation quality

---

## Funding Narrative

### The Ask:
**$500K-$2M to scale PulseCommand to $100K+ MRR**

### The Pitch:
1. **Problem**: Small businesses need $5-10K/month marketing team but can't afford it
2. **Solution**: AI-powered monthly marketing automation (whitepaper, articles, posts, videos, emails, podcasts)
3. **Traction**: [Will fill with user numbers]
4. **Market**: $50B+ content creation market
5. **Unit Economics**: $149-399/month × target customers = path to $10M+ ARR
6. **Moat**: Brand Strategy Plan (unique) + learning from interviews (data advantage)
7. **Exit**: Acquisition by HubSpot, Salesforce, Adobe ($50-200M+)

### Why Now:
- AI image generation is mature (Gemini, DALL-E)
- AI text generation is excellent (Claude, GPT-4)
- Voice AI is ready (VAPI)
- Video AI is accessible (HeyGen)
- No competitor has built integrated monthly automation

---

## Technical Debt / Nice to Haves

- [ ] PDF generation server-side (Puppeteer) instead of client-side html2pdf.js
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework for content
- [ ] Content calendar drag-and-drop
- [ ] AI content customization/editing interface
- [ ] Competitor analysis tracking
- [ ] Influencer identification
- [ ] Team collaboration (multiple users per account)
- [ ] API for third-party integrations
- [ ] Webhook support for custom integrations

---

## Success Metrics to Track

- Monthly signups
- MRR (Monthly Recurring Revenue)
- Churn rate
- Content generation success rate
- Time to first content generated
- User engagement (monthly active users)
- Feature adoption (which content types are used)
- NPS (Net Promoter Score)
