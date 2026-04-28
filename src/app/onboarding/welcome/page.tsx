"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Zap, Star, ArrowRight, Share2, Mic, Video, BarChart3, Loader2, Phone } from "lucide-react";
import OnboardingNav from "@/components/OnboardingNav";

const included = [
  { icon: <Share2 className="w-4 h-4 text-primary-600" />, text: "150 social posts/month across 5 channels" },
  { icon: <Mic className="w-4 h-4 text-purple-600" />, text: "Bi-weekly AI voice podcast (26 eps/year)" },
  { icon: <Video className="w-4 h-4 text-rose-600" />, text: "4 HeyGen AI presenter videos per month" },
  { icon: <BarChart3 className="w-4 h-4 text-teal-600" />, text: "Monthly performance report & review" },
];

const STEP_ORDER = ["signed_up", "brand_assets_saved", "avatar_selected", "voice_selected", "call_done", "active"];

function stepComplete(currentStep: string, targetStep: string) {
  const ci = STEP_ORDER.indexOf(currentStep);
  const ti = STEP_ORDER.indexOf(targetStep);
  return ci >= ti && ci >= 0 && ti >= 0;
}

export default function WelcomePage() {
  const [onboardingStep, setOnboardingStep] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        setOnboardingStep(d.onboarding_step ?? "signed_up");
        setPhone(d.phone ?? "");
        setPhoneInput(d.phone ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function savePhone() {
    if (!phoneInput.trim()) { setPhoneError("Please enter your phone number"); return; }
    setSavingPhone(true);
    setPhoneError("");
    try {
      const res = await fetch("/api/onboarding/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setPhone(phoneInput.trim());
      setPhoneSaved(true);
    } catch {
      setPhoneError("Failed to save phone number. Please try again.");
    } finally {
      setSavingPhone(false);
    }
  }

  const hasBrandAssets = stepComplete(onboardingStep, "brand_assets_saved");
  const hasAvatar = stepComplete(onboardingStep, "avatar_selected");
  const hasVoice = stepComplete(onboardingStep, "voice_selected");
  const hasPhone = !!phone;
  const hasCall = stepComplete(onboardingStep, "call_done");

  // Next unlocked step
  const nextHref = !hasBrandAssets
    ? "/onboarding/brand-assets"
    : !hasAvatar
    ? "/onboarding/choose-avatar"
    : !hasVoice
    ? "/onboarding/choose-voice"
    : !hasCall
    ? "/onboarding/interview"
    : "/dashboard";

  const nextLabel = !hasBrandAssets
    ? "Start Step 2: Brand Assets →"
    : !hasAvatar
    ? "Continue: Choose Avatar →"
    : !hasVoice
    ? "Continue: Choose Voice →"
    : !hasCall
    ? "Continue: Brand Interview →"
    : "Go to Dashboard →";

  const steps = [
    {
      num: 1,
      title: "Create Your Account",
      desc: "Account created and plan activated successfully.",
      done: true,
      href: null as string | null,
      cta: null as string | null,
      locked: false,
    },
    {
      num: 2,
      title: "Set Up Your Brand Assets",
      desc: "Scan your website, upload your logo, set brand colors and tone of voice.",
      done: hasBrandAssets,
      href: "/onboarding/brand-assets",
      cta: hasBrandAssets ? null : "Set Up Brand",
      locked: false,
    },
    {
      num: 3,
      title: "Choose Your AI Avatar",
      desc: "Pick a professional AI presenter from our library for your monthly brand videos.",
      done: hasAvatar,
      href: hasBrandAssets ? "/onboarding/choose-avatar" : null,
      cta: hasAvatar ? null : hasBrandAssets ? "Choose Avatar" : null,
      locked: !hasBrandAssets && !hasAvatar,
    },
    {
      num: 4,
      title: "Choose Your AI Voice",
      desc: "Select a voice from our ElevenLabs library for your bi-weekly podcast episodes.",
      done: hasVoice,
      href: hasAvatar ? "/onboarding/choose-voice" : null,
      cta: hasVoice ? null : hasAvatar ? "Choose Voice" : null,
      locked: !hasAvatar && !hasVoice,
    },
    {
      num: 5,
      title: "Complete Your Brand Interview",
      desc: "A 15-minute AI phone call captures your brand story. This unlocks all content generation.",
      done: hasCall,
      href: hasVoice ? "/onboarding/interview" : null,
      cta: hasCall ? null : hasVoice ? "Start Interview" : null,
      locked: !hasVoice && !hasCall,
    },
    {
      num: 6,
      title: "Your Content Goes Live",
      desc: "We build your full content pipeline — 150 posts, videos, podcast episodes, and reports.",
      done: hasCall,
      href: hasCall ? "/dashboard" : null,
      cta: hasCall ? "Go to Dashboard" : null,
      locked: !hasCall,
    },
  ];

  return (
    <>
      <OnboardingNav current="welcome" />

      <main className="min-h-screen bg-neutral-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-14 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-sm font-medium mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Account Active — 14-Day Free Trial Started
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome to BundledContent!
          </h1>
          <p className="text-primary-100 text-base max-w-xl mx-auto">
            Your AI marketing engine is ready. Complete the steps below to launch your full content pipeline.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Steps */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-neutral-900">Your Setup Checklist</h2>
              <p className="text-sm text-neutral-500 mb-2">Complete all steps to activate your content pipeline.</p>

              {/* Phone number collection — shown if not yet saved */}
              {!loading && !hasPhone && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">Add Your Phone Number</p>
                      <p className="text-xs text-amber-700">Required for your brand interview call and SMS reminders.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="flex-1 px-3 py-2 border border-amber-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    <button
                      onClick={savePhone}
                      disabled={savingPhone}
                      className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center gap-1.5"
                    >
                      {savingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                  {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
                </div>
              )}

              {!loading && hasPhone && !phoneSaved && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Phone saved: <span className="font-mono font-medium">{phone}</span>
                </div>
              )}

              {phoneSaved && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Phone number saved!
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12 text-neutral-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
                </div>
              ) : (
                steps.map((step) => {
                  const isActive = !step.done && !step.locked && !!step.href;
                  return (
                    <div
                      key={step.num}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                        step.done
                          ? "bg-green-50 border-green-200"
                          : isActive
                          ? "bg-primary-50 border-2 border-primary-300 relative overflow-hidden"
                          : "bg-white border-neutral-200 opacity-50"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          NEXT STEP
                        </div>
                      )}

                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        step.done ? "bg-green-500" : isActive ? "bg-primary-600" : "bg-neutral-200"
                      }`}>
                        {step.done
                          ? <Check className="w-5 h-5 text-white" />
                          : <span className={`font-bold text-sm ${isActive ? "text-white" : "text-neutral-500"}`}>{step.num}</span>
                        }
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-semibold ${step.done ? "text-green-900" : isActive ? "text-primary-900" : "text-neutral-700"}`}>
                            {step.title}
                          </p>
                          {step.done && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Done ✓</span>}
                          {step.locked && <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">Locked</span>}
                        </div>
                        <p className={`text-xs mb-3 ${step.done ? "text-green-700" : isActive ? "text-primary-700" : "text-neutral-500"}`}>
                          {step.desc}
                        </p>
                        {step.href && step.cta && (
                          <Link
                            href={step.href}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            {step.cta} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-5">
              {/* Plan */}
              <div className="bg-neutral-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">BundledContent</p>
                    <p className="text-neutral-400 text-xs">Complete AI Marketing Service</p>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-b border-neutral-800">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold">$745</span>
                      <span className="text-neutral-400 text-sm">/mo</span>
                    </div>
                    <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">No lock-in</span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-1">First charge after 14-day free trial</p>
                </div>

                <div className="space-y-3">
                  {included.map(({ icon, text }) => (
                    <div key={text} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <span className="text-neutral-300 text-xs leading-relaxed">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trial */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-bold text-green-900">Free Trial Active</p>
                </div>
                <p className="text-xs text-green-700 mb-3">14 days remaining. No charge until your trial ends.</p>
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "100%" }} />
                </div>
                <p className="text-xs text-green-600 mt-2">Trial ends in 14 days</p>
              </div>

              {/* Next step CTA */}
              {!loading && (
                <Link
                  href={nextHref}
                  className="block w-full py-3 bg-primary-600 text-white text-sm font-bold rounded-xl text-center hover:bg-primary-700 transition-colors shadow-md"
                >
                  {nextLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
