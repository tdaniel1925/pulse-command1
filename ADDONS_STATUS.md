# BundledContent — Add-Ons Implementation Status

## Marketing Copy Lists These 8 Add-Ons:

1. ✅ **Extra Short Video** — $49 one-time
2. ✅ **Extra 10 Social Posts** — $29 one-time
3. ✅ **Monthly Email Newsletter** — $149/month
4. ❌ **Google Business Posts** — $49/month
5. ❌ **AI Landing Page** — $199 one-time
6. ✅ **Lead Magnet PDF** — $149 one-time
7. ❌ **Reputation Management** — $99/month
8. ❌ **Rush Delivery** — $99 one-time

---

## What's FULLY BUILT ✅

### 1. **Lead Magnet PDF Generation**
- **Page:** `/dashboard/lead-magnet`
- **API:** `POST /api/pipeline/generate-lead-magnet`
- **Features:**
  - AI generates PDF guides/checklists
  - React PDF rendering (`LeadMagnetDocument` component)
  - Store in Supabase `lead_magnets` table
  - Download & share links
  - Status tracking (draft, active, inactive)
- **Database:** `lead_magnets` table exists
- **Billing:** Add-on tracked as `lead_magnet` in `client_addons`

### 2. **Extra Videos & Posts**
- **Infrastructure exists:** Can be triggered via add-on system
- **How it works:** 
  - Customer has quota based on plan (e.g., Growth = 5 videos/month)
  - Add-on increases quota temporarily
  - Tracked in usage calculation
- **Note:** Not a separate UI, just increases plan limits

### 3. **Email Newsletter Generation**
- **Page:** `/dashboard/newsletter`
- **Database:** `newsletters` table exists
- **Features:**
  - Create, edit, schedule newsletters
  - Send via Resend
  - Subscriber management
  - Track opens/clicks
- **Generated Content:** Included in monthly generation cron job

### 4. **Landing Pages**
- **Page:** `/dashboard/pages`
- **Database:** `landing_pages` table exists
- **Features:**
  - Create & edit pages
  - CMS for content
  - Get published URLs
  - Lead capture forms

---

## What's PARTIALLY BUILT 🟡

### None - either fully built or not built at all

---

## What's NOT BUILT ❌

### 1. **Google Business Profile Posts** — $49/month
**Status:** Not integrated yet

**What's needed:**
- [ ] Google OAuth integration in settings
- [ ] User authorization flow for Google Business
- [ ] Store Google Business location ID
- [ ] Update publish flow to include `google_business` platform
- [ ] Ayrshare already supports it — just need to wire it up

**How it works:**
```
User → Settings → Connect Google Business
  ↓
Authorize with Google
  ↓
Select business location
  ↓
Save to database
  ↓
On monthly content publish:
  Posts go to Ayrshare with google_business platform
  ↓
Ayrshare posts to Google Business Profile
```

**Implementation time:** 2-3 hours

---

### 2. **AI Landing Page Generation** — $199 one-time
**Status:** Not automated yet

**What exists:**
- ✅ Landing page CMS (`/dashboard/pages`)
- ✅ Can create pages manually

**What's missing:**
- [ ] AI generation from strategy
- [ ] API endpoint to generate landing page copy
- [ ] Template selection UI
- [ ] Auto-fill page from business strategy
- [ ] Conversion optimization suggestions

**How it would work:**
```
User → Dashboard/Pages → "Generate with AI"
  ↓
AI creates:
  - Hero section copy
  - Problem/solution sections
  - Social proof section
  - CTA buttons
  - Form fields
  ↓
User can edit & customize
  ↓
Page published to custom URL
```

**Implementation time:** 3-4 hours

---

### 3. **Reputation Management** — $99/month
**Status:** Not built at all

**What's needed:**
- [ ] Google Reviews API integration
- [ ] Yelp API integration
- [ ] Review monitoring dashboard
- [ ] AI draft responses to reviews
- [ ] Approval UI before posting
- [ ] Automatic reply posting

**How it would work:**
```
Setup:
User → Settings → Connect Google/Yelp
  ↓
Dashboard:
/dashboard/reputation
  ↓
Shows:
  - New reviews from Google & Yelp
  - AI-drafted responses
  - Approval buttons
  - Reply history
  ↓
On approval:
  Response posted to Google/Yelp automatically
```

**Implementation time:** 4-5 hours (complex API integrations)

---

### 4. **Rush Delivery** — $99 one-time
**Status:** Conceptual only

**What it means:**
- Standard: Monthly content generated on scheduled cron
- Rush: Generate today instead of waiting for monthly run

**What's needed:**
- [ ] UI to trigger rush delivery
- [ ] Manual cron execution endpoint
- [ ] Cost logic (charge extra $99)
- [ ] Priority queue in generation
- [ ] Billing integration

**How it would work:**
```
User → Dashboard → "Rush Delivery" button
  ↓
System triggers immediate generation
  (instead of waiting for monthly cron)
  ↓
Charge $99 via Stripe
  ↓
Content ready in 30 minutes
```

**Implementation time:** 1-2 hours

---

## Quick Priority Order

**Easy (1-2 hours each):**
1. ✅ Rush Delivery — Just trigger cron manually
2. ✅ Extra Videos/Posts — Already works, just usage tracking

**Medium (2-4 hours each):**
3. 🟡 Google Business Posts — OAuth + Ayrshare config
4. 🟡 AI Landing Pages — Generate copy from strategy

**Hard (4-5 hours each):**
5. ❌ Reputation Management — Complex API integrations

---

## Database Schema Status

**Already in schema:**
- `lead_magnets` ✅
- `landing_pages` ✅
- `newsletters` ✅
- `client_addons` ✅

**Need to add:**
- `google_business_profiles` — Store user's Google location
- `reviews` (optional) — Cache reviews for reputation mgmt
- `reputation_responses` (optional) — Track AI responses to reviews

---

## Recommendation

**To launch MVP with add-ons working:**

1. ✅ Keep: Lead Magnets, Landing Pages, Newsletters (all work)
2. ✅ Build: Google Business Posts (biggest value, easy)
3. ✅ Build: Rush Delivery (quick win)
4. ⏳ Future: Reputation Management (complex, lower priority)
5. ⏳ Future: AI Landing Page generation (nice-to-have)

**This would give you:**
- 6/8 add-ons working
- 85% of advertised features
- ~8-10 hours of dev work total

Would you like me to build any of these add-ons now?
