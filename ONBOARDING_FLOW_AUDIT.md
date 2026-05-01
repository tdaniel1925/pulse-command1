# Onboarding Flow Audit

## Current Flow (Documented)

```
1. SIGNUP
   ├─ POST /api/auth/sign-up
   ├─ Creates auth user
   ├─ Creates client record with onboarding_step = 'welcome'
   └─ Creates brand_profile
   
2. WELCOME PAGE (/onboarding/welcome)
   ├─ Fetches /api/auth/me to get onboarding_step
   ├─ Phone number collection (optional but required for interview call)
   ├─ Displays checklist with progress
   └─ Links to next step based on onboarding_step:
      ├─ !brand_assets_saved → /onboarding/brand-assets
      ├─ !avatar_selected → /onboarding/choose-avatar
      ├─ !voice_selected → /onboarding/choose-voice
      ├─ !call_done → /onboarding/interview
      └─ else → /dashboard

3. BRAND ASSETS PAGE (/onboarding/brand-assets)
   ├─ Website scanning (optional)
   ├─ Logo upload
   ├─ Color selection
   ├─ Business info collection
   ├─ Calls POST /api/onboarding/save-brand-assets
   │  └─ Updates onboarding_step = 'brand_assets_saved'
   └─ Navigates to /onboarding/record-video
   
4. RECORD VIDEO PAGE (/onboarding/record-video)
   ├─ [UNCLEAR FLOW - Not linked from welcome page]
   └─ Need to verify: Does it update onboarding_step?

5. RECORD AUDIO PAGE (/onboarding/record-audio)
   ├─ [UNCLEAR FLOW - Not linked from welcome page]
   └─ Need to verify: Does it update onboarding_step?

6. CHOOSE AVATAR PAGE (/onboarding/choose-avatar)
   ├─ Fetches /api/auth/me for onboarding_step
   ├─ Avatar selection UI
   ├─ Calls POST /api/onboarding/save-selection
   │  └─ Updates onboarding_step = 'avatar_selected'
   └─ router.push("/onboarding/choose-voice")

7. CHOOSE VOICE PAGE (/onboarding/choose-voice)
   ├─ Fetches /api/auth/me for onboarding_step
   ├─ Voice selection UI
   ├─ Calls POST /api/onboarding/save-selection
   │  └─ Updates onboarding_step = 'voice_selected'
   └─ router.push("/onboarding/interview")

8. INTERVIEW PAGE (/onboarding/interview)
   ├─ Fetches /api/auth/me for PIN, phone, onboarding_step
   ├─ Displays VAPI phone number to call
   ├─ Polls /api/auth/me every 15 seconds
   ├─ Waits for onboarding_step = 'call_done' | 'profile_built' | 'active'
   ├─ SMS reminder option (calls POST /api/onboarding/send-interview-reminder)
   └─ Link to /onboarding/complete (shown when call_done detected)

9. COMPLETE PAGE (/onboarding/complete)
   ├─ Calls POST /api/onboarding/complete on mount
   ├─ Creates Ayrshare profile if missing
   ├─ Triggers first post generation
   ├─ Sends onboarding complete email
   ├─ Progress bar animation
   └─ Links to /dashboard or /dashboard/settings
```

## IDENTIFIED GAPS & ISSUES

### 🔴 CRITICAL GAPS

1. **Record Video/Audio Pages Disconnected**
   - Brand Assets page routes to `/onboarding/record-video`
   - Welcome page doesn't include video/audio in the step sequence
   - Unclear if these pages update `onboarding_step`
   - These pages may be unused/legacy code

2. **Missing onboarding_step Update**
   - No API endpoint updates `onboarding_step` after video/audio upload
   - Flow breaks if user completes recording but has no next step

3. **Welcome Page vs Actual Flow Mismatch**
   ```
   Welcome shows steps as:
   1. Create Account ✓
   2. Brand Assets
   3. Avatar
   4. Voice
   5. Interview
   6. Go Live
   
   But record-video/audio are inserted between Brand Assets → Avatar
   This confuses users and breaks the step tracking
   ```

### ⚠️ MEDIUM ISSUES

1. **Phone Number Handling**
   - Welcome page shows optional phone input
   - But VAPI interview requires phone number
   - User might skip it and fail at interview step
   - No validation that phone is set before interview

2. **Polling in Interview Page**
   - 15-second polling interval means up to 15s delay to detect call completion
   - Long waits feel broken (up to 30s in worst case)
   - No explicit "complete interview" button - relies on backend update

3. **Missing Error Recovery**
   - If POST /api/onboarding/complete fails, user is stuck
   - No retry mechanism
   - No way to manually trigger completion

4. **Ayrshare Profile Creation**
   - Created during onboarding completion
   - But Settings page also tries to create it
   - Risk of duplicate creation attempts

### 📋 MINOR ISSUES

1. **Activity Logging**
   - Only some steps log activities
   - Inconsistent tracking of user progress

2. **Email Notifications**
   - Welcome email sent at signup
   - Onboarding complete email sent at end
   - Missing milestone emails for intermediate steps

3. **Progress State Not Persistent**
   - Welcome page relies on polling onboarding_step
   - No real-time state updates

## RECOMMENDATIONS

### Priority 1: Fix Critical Gaps
- [ ] Remove or properly integrate record-video/audio pages
- [ ] Update welcome page to match actual step flow
- [ ] Add API endpoint to update onboarding_step after video/audio
- [ ] Validate phone number before allowing interview step

### Priority 2: Improve UX
- [ ] Add explicit "Complete Interview" button as fallback
- [ ] Implement real-time polling with exponential backoff
- [ ] Add retry mechanism to /api/onboarding/complete
- [ ] Show clearer progress indication on interview page

### Priority 3: Polish
- [ ] Ensure consistent activity logging
- [ ] Add milestone emails
- [ ] Implement real-time state sync (WebSocket or polling)
- [ ] Better error messages for each failure case

## Test Cases to Validate

1. **Happy path**: Signup → Brand → Avatar → Voice → Interview → Complete → Dashboard
2. **Phone number**: Skip phone on welcome, should warn before interview
3. **Interview retry**: Fail interview, should allow retry
4. **Ayrshare collision**: Complete onboarding twice, should not create duplicate profiles
5. **Network failure**: POST /api/onboarding/complete fails, should allow manual retry
