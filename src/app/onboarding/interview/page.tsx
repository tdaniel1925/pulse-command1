"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mic, List, Info, Shield, Clock, Zap, CheckCircle,
  CalendarCheck, MessageSquare, BarChart3, Loader2
} from "lucide-react";
import OnboardingNav from "@/components/OnboardingNav";

const questions = [
  { num: 1, q: "What is your business name and industry?", desc: "Tell us about what you do and who you serve.", tag: "Business", tagColor: "bg-blue-50 text-blue-600" },
  { num: 2, q: "Who is your ideal customer?", desc: "Age, location, interests, pain points — the more detail the better.", tag: "Audience", tagColor: "bg-purple-50 text-purple-600" },
  { num: 3, q: "What's your brand tone & personality?", desc: "Professional, friendly, luxury, community-focused? This shapes your AI content voice.", tag: "Brand", tagColor: "bg-amber-50 text-amber-600" },
  { num: 4, q: "Which social platforms do you use?", desc: "Instagram, Facebook, LinkedIn, TikTok, X — we'll auto-post to your active channels.", tag: "Channels", tagColor: "bg-green-50 text-green-600" },
  { num: 5, q: "What are your top 3 marketing goals?", desc: "Lead generation, brand awareness, client retention, or something else?", tag: "Goals", tagColor: "bg-indigo-50 text-indigo-600" },
  { num: 6, q: "What content do you currently produce?", desc: "Blog posts, videos, newsletters, nothing yet — we'll build on what you have.", tag: "Content", tagColor: "bg-rose-50 text-rose-600" },
  { num: 7, q: "Who are your main competitors?", desc: "Knowing your competitive landscape helps us differentiate your voice.", tag: "Market", tagColor: "bg-teal-50 text-teal-600" },
  { num: 8, q: "What's your monthly marketing budget?", desc: "We'll tailor recommendations to maximise your investment.", tag: "Budget", tagColor: "bg-orange-50 text-orange-600" },
];

export default function InterviewPage() {
  const [started, setStarted] = useState(false);

  function handleStart() {
    setStarted(true);
    setTimeout(() => {
      // In a real app this would navigate to the interview flow
    }, 1500);
  }

  return (
    <>
      <OnboardingNav current="interview" />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Step 4 — Onboarding Interview
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Your AI Onboarding Interview</h1>
          <p className="text-primary-100 text-base max-w-xl mx-auto">
            Answer 8 quick questions so we can personalise PulseCommand for your business. Takes about 5–10 minutes.
          </p>
        </div>
      </div>

      <main className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left sidebar */}
            <aside className="lg:col-span-1 space-y-5">
              {/* Session context */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Onboarding Session</p>
                    <p className="text-primary-100 text-xs">Scheduled &amp; confirmed</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { icon: <Clock className="w-4 h-4 text-primary-600" />, label: "Duration", value: "5–10 minutes" },
                    { icon: <MessageSquare className="w-4 h-4 text-primary-600" />, label: "Format", value: "Voice or text input" },
                    { icon: <Shield className="w-4 h-4 text-primary-600" />, label: "Privacy", value: "Encrypted & private" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                      <div>
                        <p className="text-xs text-neutral-500">{label}</p>
                        <p className="text-sm font-semibold text-neutral-800">{value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 mb-2 font-medium">Interview completion helps personalise your experience</p>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div className="progress-bar-fill h-2 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full" />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-neutral-400">0% complete</span>
                      <span className="text-xs text-neutral-400">8 questions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why it matters */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 mb-1">Why this matters</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Businesses that complete the interview see <span className="font-bold">40% better</span> content personalisation and launch their first campaign <span className="font-bold">2× faster</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                <p className="text-sm font-bold text-neutral-900 mb-3">Tips for best results</p>
                <ul className="space-y-2">
                  {[
                    "Speak naturally — there are no wrong answers",
                    "Think about your current customers",
                    "Have your business website handy",
                    "Be as specific as possible",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-neutral-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Right: Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* What to expect */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">What to Expect</h2>
                    <p className="text-xs text-neutral-500">A guided, conversational experience</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { icon: <Mic className="w-6 h-6 text-primary-600" />, bg: "bg-primary-50", title: "Voice First", desc: "Answer naturally by voice or type your responses — your choice." },
                    { icon: <Zap className="w-6 h-6 text-indigo-600" />, bg: "bg-indigo-50", title: "AI-Powered", desc: "Our AI analyses your answers to build a personalised content strategy." },
                    { icon: <BarChart3 className="w-6 h-6 text-green-600" />, bg: "bg-green-50", title: "Instant Results", desc: "Your custom marketing brief is ready the moment you finish." },
                  ].map(({ icon, bg, title, desc }) => (
                    <div key={title} className={`${bg} rounded-xl p-5 text-center`}>
                      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3 border border-white`}>
                        {icon}
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-1">{title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 rounded-xl p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-bold mb-2">Ready to personalise your experience?</h3>
                      <p className="text-primary-100 text-sm mb-3">Your AI content strategy will be ready instantly after you finish.</p>
                      <div className="flex items-center gap-4 text-xs text-primary-200">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Encrypted &amp; private</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~5–10 min</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3 flex-shrink-0">
                      {!started ? (
                        <button
                          onClick={handleStart}
                          className="cta-pulse px-8 py-4 bg-white text-primary-700 font-bold rounded-lg hover:bg-primary-50 transition-all shadow-lg text-sm flex items-center gap-2 whitespace-nowrap"
                        >
                          <Mic className="w-4 h-4" />
                          Start My Interview
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-8 py-4 bg-white/80 text-primary-700 font-bold rounded-lg text-sm flex items-center gap-2 whitespace-nowrap opacity-80 cursor-not-allowed"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Starting...
                        </button>
                      )}
                      <p className="text-xs text-primary-200">Recommended before you launch</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The 8 Questions */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <List className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">The 8 Interview Questions</h2>
                      <p className="text-xs text-neutral-500">A preview of what you&apos;ll be asked</p>
                    </div>
                  </div>
                  <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-primary-100">~5 min</span>
                </div>

                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q.num} className="flex items-start gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold text-xs">{q.num}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 mb-1">{q.q}</p>
                        <p className="text-xs text-neutral-500">{q.desc}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${q.tagColor}`}>{q.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-neutral-500">
                  Want to skip for now?{" "}
                  <Link href="#" className="text-primary-600 font-medium hover:underline">
                    Go to your dashboard →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
