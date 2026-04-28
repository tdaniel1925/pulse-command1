"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic, Phone, Shield, Clock, Zap, CheckCircle, Copy, Check, RefreshCw
} from "lucide-react";
import OnboardingNav from "@/components/OnboardingNav";

export default function InterviewPage() {
  const [pin, setPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setPin(d.onboarding_pin ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function copyPin() {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const phoneNumber = process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER ?? "+1 (936) 237-3368";

  return (
    <>
      <OnboardingNav current="interview" />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Step 5 — Brand Interview
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Your AI Brand Interview</h1>
          <p className="text-primary-100 text-base max-w-xl mx-auto">
            Call our AI below, enter your PIN, and answer a few questions about your business. Takes about 10–15 minutes.
            This call generates all your content.
          </p>
        </div>
      </div>

      <main className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Main call card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-8 py-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Call This Number</h2>
              <p className="text-primary-100 text-sm">Our AI will answer and guide you through the interview</p>
            </div>

            <div className="p-8 text-center space-y-6">
              {/* Phone number */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Call this number</p>
                <a
                  href={`tel:${phoneNumber.replace(/\D/g, "")}`}
                  className="text-4xl font-bold text-primary-600 hover:text-primary-700 tracking-wide"
                >
                  {phoneNumber}
                </a>
                <p className="text-xs text-neutral-400 mt-1">Tap to call on mobile</p>
              </div>

              <div className="border-t border-neutral-100" />

              {/* PIN */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Your unique PIN</p>
                <p className="text-sm text-neutral-500 mb-3">The AI will ask for this to identify your account</p>

                {loading ? (
                  <div className="flex items-center justify-center gap-2 text-neutral-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading your PIN...</span>
                  </div>
                ) : pin ? (
                  <div className="inline-flex items-center gap-4 bg-neutral-900 text-white px-8 py-4 rounded-2xl">
                    <span className="text-4xl font-bold tracking-[0.3em] font-mono">{pin}</span>
                    <button
                      onClick={copyPin}
                      className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                      title="Copy PIN"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">Could not load PIN — please refresh the page.</p>
                )}
              </div>

              <div className="border-t border-neutral-100" />

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {[
                  { num: "1", title: "Call the number", desc: "Our AI answers 24/7 — no scheduling needed." },
                  { num: "2", title: "Enter your PIN", desc: "The AI will ask for your 6-digit PIN to identify you." },
                  { num: "3", title: "Answer questions", desc: "Tell us about your business, audience, and goals." },
                ].map((s) => (
                  <div key={s.num} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">{s.num}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 mb-0.5">{s.title}</p>
                      <p className="text-xs text-neutral-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Clock className="w-4 h-4 text-primary-600" />, label: "~10–15 minutes", sub: "At your own pace" },
              { icon: <Zap className="w-4 h-4 text-indigo-600" />, label: "Instant results", sub: "Content generated after call" },
              { icon: <Shield className="w-4 h-4 text-green-600" />, label: "Private & secure", sub: "Encrypted & never shared" },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{label}</p>
                  <p className="text-xs text-neutral-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Mic className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 mb-2">Tips for best results</h4>
                <ul className="space-y-1.5">
                  {[
                    "Find a quiet spot — the AI understands you better without background noise",
                    "Have your website URL handy",
                    "Think about your top 3 customers and what they love about you",
                    "You can redo this call anytime from your dashboard",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-amber-800">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* After call */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-green-900 mb-1">After your call</p>
            <p className="text-xs text-green-700">
              Your content pipeline activates automatically — 150 social posts, 4 AI videos, podcast episodes,
              and your first report will be ready within 24 hours.
            </p>
          </div>

          <div className="text-center">
            <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
              Skip for now — go to dashboard →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
