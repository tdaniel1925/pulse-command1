"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Globe, Loader2, Sparkles, Check } from "lucide-react";

export default function DemoPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start demo");
      router.push(`/demo/generating/${data.demoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav */}
      <nav className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-neutral-900">PulseCommand</span>
          </Link>
          <Link href="/sign-up" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
            Already a member? Sign in →
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Free Sample Content — No Credit Card
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            See Your Business as an AI Marketing Machine
          </h1>
          <p className="text-lg text-neutral-600">
            Enter your website and we&apos;ll generate real sample content for your brand —
            social posts, a podcast episode, and an AI presenter video.
          </p>
        </div>

        {/* What you'll get */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { emoji: "📱", label: "5 Social Posts", sub: "Instagram, Facebook, LinkedIn, X" },
            { emoji: "🎙️", label: "Podcast Sample", sub: "2-min AI voice episode" },
            { emoji: "🎬", label: "AI Video", sub: "HeyGen presenter video" },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <p className="font-semibold text-neutral-900 text-sm">{item.label}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone (optional — for SMS notification)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Your Website <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="yourwebsite.com"
                  className="w-full pl-10 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">We&apos;ll scan it to build your brand profile automatically.</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Starting your demo…</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate My Free Sample Content</>
              )}
            </button>

            <div className="flex items-center justify-center gap-6 pt-1">
              {["No credit card", "Takes ~3 minutes", "Real content for your brand"].map(t => (
                <span key={t} className="flex items-center gap-1 text-xs text-neutral-400">
                  <Check className="w-3 h-3 text-green-500" /> {t}
                </span>
              ))}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
