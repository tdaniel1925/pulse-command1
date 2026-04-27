import Link from "next/link";
import { Check, Zap, Calendar, Mic, LayoutDashboard, ArrowRight, Star } from "lucide-react";
import OnboardingNav from "@/components/OnboardingNav";

const quickActions = [
  { icon: <LayoutDashboard className="w-5 h-5 text-primary-600" />, title: "Explore Your Dashboard", desc: "See your marketing command centre", href: "#", cta: "Open Dashboard" },
  { icon: <Zap className="w-5 h-5 text-indigo-600" />, title: "Create Your First Campaign", desc: "AI generates it in under 60 seconds", href: "#", cta: "Start Creating" },
  { icon: <Mic className="w-5 h-5 text-purple-600" />, title: "Set Up AI Voice Podcast", desc: "Clone your voice and go live", href: "#", cta: "Get Started" },
];

export default function WelcomePage() {
  return (
    <>
      <OnboardingNav current="welcome" />

      <main className="min-h-screen bg-neutral-50">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 py-14 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-sm font-medium mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Account Active
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome to PulseCommand! 🎉
          </h1>
          <p className="text-primary-100 text-base max-w-xl mx-auto">
            Your account is live. Let&apos;s get your marketing engine running.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Steps checklist */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="text-xl font-bold text-neutral-900">Your Getting Started Checklist</h2>

              {/* Step 1 - Done */}
              <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-green-900">Create Your Account</p>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Done ✓</span>
                  </div>
                  <p className="text-xs text-green-700">Account created and plan activated successfully.</p>
                </div>
              </div>

              {/* Step 2 - Done */}
              <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-green-900">Schedule Onboarding Session</p>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Done ✓</span>
                  </div>
                  <p className="text-xs text-green-700">Session booked with your onboarding specialist.</p>
                </div>
              </div>

              {/* Step 3 - Action Required */}
              <div className="flex items-start gap-4 p-4 bg-primary-50 border-2 border-primary-300 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  ACTION NEEDED
                </div>
                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cta-pulse">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary-900 mb-1">Complete Your Onboarding Interview</p>
                  <p className="text-xs text-primary-700 mb-3">
                    Help us personalise PulseCommand for your business. Takes about 10 minutes.
                  </p>
                  <Link
                    href="/onboarding/interview"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Start Interview <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Step 4 - Pending */}
              <div className="flex items-start gap-4 p-4 bg-white border border-neutral-200 rounded-2xl opacity-60">
                <div className="w-9 h-9 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-neutral-500 font-bold text-sm">4</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-700 mb-1">Launch Your First Campaign</p>
                  <p className="text-xs text-neutral-500">Unlocked after your onboarding interview.</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition-shadow group"
                    >
                      <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary-50 transition-colors">
                        {action.icon}
                      </div>
                      <p className="text-sm font-bold text-neutral-900 mb-1">{action.title}</p>
                      <p className="text-xs text-neutral-500 mb-3">{action.desc}</p>
                      <span className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                        {action.cta} <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-5">
              {/* Plan card */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-4">Your Active Plan</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 text-sm">PulseFlow</p>
                      <p className="text-xs text-neutral-500">The Growth Tier</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">$129<span className="text-xs text-neutral-500 font-normal">/mo</span></p>
                    <p className="text-xs text-green-600 font-medium">Member Price</p>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-neutral-100">
                  {["Unlimited Landing Pages", "150 Social Posts/mo", "AI Voice Podcast", "CRM Integration"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/#pricing" className="mt-4 block w-full text-center py-2 text-xs font-semibold text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                  Upgrade Plan
                </Link>
              </div>

              {/* Trial card */}
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

              {/* Session reminder */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <p className="text-sm font-bold text-neutral-900">Upcoming Session</p>
                </div>
                <p className="text-xs text-neutral-600 mb-1">Onboarding call with your specialist</p>
                <p className="text-xs text-primary-600 font-semibold">Check your email for details</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
