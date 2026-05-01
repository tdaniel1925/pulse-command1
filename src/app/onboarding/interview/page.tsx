"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone, Copy, Check, Shield, Clock, Zap, CheckCircle,
  MessageSquare, Bell, Calendar, Loader2, ArrowRight, Sparkles
} from "lucide-react";
import OnboardingNav from "@/components/OnboardingNav";
import { formatPhone } from "@/lib/formatPhone";

type ReminderOption = 'now' | '1h' | '3h' | 'tomorrow' | 'custom';

export default function InterviewPage() {
  const [pin, setPin] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [onboardingStep, setOnboardingStep] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reminderOption, setReminderOption] = useState<ReminderOption | null>(null);
  const [customTime, setCustomTime] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [smsError, setSmsError] = useState('');

  const vapiPhone = process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER ?? '+1 (936) 237-3368';
  const callDone = onboardingStep === 'call_done' || onboardingStep === 'profile_built' || onboardingStep === 'active';

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        setPin(d.onboarding_pin ?? null);
        setPhone(d.phone ?? '');
        setPhoneInput(d.phone ?? '');
        setFirstName(d.first_name ?? '');
        setOnboardingStep(d.onboarding_step ?? '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Poll for call completion
  useEffect(() => {
    if (callDone) return;
    const interval = setInterval(() => {
      fetch("/api/auth/me").then(r => r.json()).then(d => {
        setOnboardingStep(d.onboarding_step ?? '');
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [callDone]);

  function copyPin() {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getScheduledTime(): Date | null {
    const now = new Date();
    if (reminderOption === '1h') return new Date(now.getTime() + 60 * 60 * 1000);
    if (reminderOption === '3h') return new Date(now.getTime() + 3 * 60 * 60 * 1000);
    if (reminderOption === 'tomorrow') {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    }
    if (reminderOption === 'custom' && customTime) return new Date(customTime);
    return null;
  }

  async function sendReminder() {
    if (!phoneInput.trim()) { setSmsError('Please enter your phone number'); return; }
    setSending(true);
    setSmsError('');
    try {
      const scheduledFor = reminderOption === 'now' ? null : getScheduledTime()?.toISOString();
      const res = await fetch('/api/onboarding/send-interview-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput.trim(), scheduledFor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to send');
      setSent(true);
    } catch (err) {
      setSmsError(err instanceof Error ? err.message : 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <OnboardingNav current="interview" />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-10 px-4">
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
            Call our AI, enter your PIN, and tell us about your business. This single call generates
            all your content — 150 posts, videos, podcast episodes, and reports.
          </p>
        </div>
      </div>

      <main className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Missing phone state */}
          {!loading && !phone && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-900 mb-2">Phone Number Required</h2>
              <p className="text-red-700 text-sm mb-6">
                You need a phone number to complete the brand interview call. Please go back and add your phone number.
              </p>
              <Link href="/onboarding/welcome" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
                Back to Welcome <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Call complete state */}
          {callDone && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-900 mb-2">Interview Complete!</h2>
              <p className="text-green-700 text-sm mb-6">
                Your brand profile is being built and content generation has started.
                Your first batch will be ready within 24 hours.
              </p>
              <Link href="/onboarding/complete" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
                See What&apos;s Next <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!callDone && phone && (
            <>
              {/* Main call card */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Call This Number</h2>
                  <p className="text-primary-100 text-sm">Available 24/7 — no scheduling needed</p>
                </div>

                <div className="p-8 text-center space-y-6">
                  {/* Phone number */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Call now</p>
                    <a
                      href={`tel:${vapiPhone.replace(/\D/g, '')}`}
                      className="text-4xl font-bold text-primary-600 hover:text-primary-700 tracking-wide"
                    >
                      {vapiPhone}
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
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading your PIN…</span>
                      </div>
                    ) : pin ? (
                      <div className="inline-flex items-center gap-4 bg-neutral-900 text-white px-8 py-4 rounded-2xl">
                        <span className="text-4xl font-bold tracking-[0.3em] font-mono">{pin}</span>
                        <button onClick={copyPin} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" title="Copy PIN">
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500">Could not load PIN — please refresh.</p>
                    )}
                  </div>

                  <div className="border-t border-neutral-100" />

                  {/* Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    {[
                      { num: "1", title: "Call the number", desc: "Our AI answers instantly, 24/7." },
                      { num: "2", title: "Enter your PIN", desc: `Say or type your 6-digit PIN when prompted.` },
                      { num: "3", title: "Tell your story", desc: "Answer questions about your business in ~15 min." },
                    ].map(s => (
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

              {/* SMS Reminder section */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-bold text-neutral-900">
                    {sent ? "Reminder Sent!" : "Send Yourself a Reminder"}
                  </h3>
                </div>

                {sent ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mt-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">SMS sent to {formatPhone(phoneInput)}</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        {reminderOption === 'now'
                          ? "You'll receive it shortly with your PIN and call instructions."
                          : "We'll text you at the scheduled time with your PIN and call instructions."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-neutral-500 mb-4">
                      Not ready to call right now? We&apos;ll send you a text with your PIN and the number.
                    </p>

                    {/* Phone input */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Your mobile number</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={e => setPhoneInput(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {/* Reminder options */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-neutral-700 mb-2">When?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {([
                          { key: 'now', label: 'Right now', icon: <Zap className="w-3.5 h-3.5" /> },
                          { key: '1h', label: 'In 1 hour', icon: <Clock className="w-3.5 h-3.5" /> },
                          { key: '3h', label: 'In 3 hours', icon: <Clock className="w-3.5 h-3.5" /> },
                          { key: 'tomorrow', label: 'Tomorrow 9am', icon: <Calendar className="w-3.5 h-3.5" /> },
                        ] as { key: ReminderOption; label: string; icon: React.ReactNode }[]).map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => setReminderOption(opt.key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${reminderOption === opt.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'}`}
                          >
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setReminderOption('custom')}
                        className={`mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${reminderOption === 'custom' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'}`}
                      >
                        <Calendar className="w-3.5 h-3.5" /> Pick a specific time
                      </button>

                      {reminderOption === 'custom' && (
                        <input
                          type="datetime-local"
                          value={customTime}
                          onChange={e => setCustomTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="mt-2 w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      )}
                    </div>

                    {smsError && <p className="text-xs text-red-600 mb-3">{smsError}</p>}

                    <button
                      onClick={sendReminder}
                      disabled={sending || !reminderOption}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        : <><MessageSquare className="w-4 h-4" /> Send SMS Reminder</>
                      }
                    </button>
                  </>
                )}
              </div>

              {/* What happens after */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <h3 className="text-sm font-bold text-primary-900">What happens after your call</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: "🤖", title: "Claude AI analyzes your transcript", desc: "Builds your full brand profile automatically" },
                    { icon: "📱", title: "150 social posts generated", desc: "Drafted for all your priority platforms" },
                    { icon: "🎙️", title: "Podcast episode scripts written", desc: "Ready for ElevenLabs to render your voice" },
                    { icon: "🎬", title: "Video scripts created", desc: "Ready to submit to HeyGen for your avatar" },
                    { icon: "📊", title: "First performance report queued", desc: "Delivered at end of your first month" },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-primary-900">{item.title}</p>
                        <p className="text-xs text-primary-700">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <Clock className="w-4 h-4 text-primary-600" />, label: "~15 minutes", sub: "At your own pace" },
                  { icon: <Zap className="w-4 h-4 text-primary-600" />, label: "Auto-generates content", sub: "No manual steps after call" },
                  { icon: <Shield className="w-4 h-4 text-green-600" />, label: "Private & secure", sub: "Encrypted, never shared" },
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

              <div className="text-center">
                <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                  Skip for now — go to dashboard →
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
