"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  open: boolean;
  onClose: () => void;
  presentationsUsed: number;
  presentationsLimit: number;
}

type Tone = "professional" | "inspiring" | "educational" | "casual";

const TONES: { value: Tone; label: string; icon: React.ReactNode }[] = [
  {
    value: "professional",
    label: "Professional",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.008c0-1.24 1.008-2.25 2.25-2.25h4.5M18 2.25l3 3m-3 0l3-3m-3 3V10" />
      </svg>
    ),
  },
  {
    value: "inspiring",
    label: "Inspiring",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    value: "educational",
    label: "Educational",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    value: "casual",
    label: "Casual",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
];

const SLIDE_COUNTS = [5, 10, 15, 20];

export function NewPresentationModal({ open, onClose, presentationsUsed, presentationsLimit }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [slideCount, setSlideCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const atLimit = presentationsUsed >= presentationsLimit;

  function handleClose() {
    setStep(1);
    setTopic("");
    setAudience("");
    setTone("professional");
    setSlideCount(10);
    setLoading(false);
    setError(null);
    setShowUpgrade(false);
    onClose();
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/presentations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, tone, slideCount }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "trial_exhausted") {
          setLoading(false);
          setShowUpgrade(true);
          return;
        }
        throw new Error(data.error ?? "Something went wrong");
      }
      router.push(`/dashboard/presentations/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Upgrade gate */}
        {(atLimit || showUpgrade) ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              {showUpgrade ? "Presentation limit reached" : "You've used your free presentation"}
            </h2>
            <p className="text-neutral-500 mb-6">Upgrade to create unlimited presentations.</p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-left mb-6">
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-indigo-700">$29</span>
                <span className="text-indigo-500">/mo</span>
                <span className="ml-2 text-sm font-semibold text-indigo-700">— Unlimited Presentations</span>
              </div>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Unlimited AI-generated presentations
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Professional slide designs
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Export to PowerPoint &amp; PDF
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Custom branding &amp; themes
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/settings"
              className="block w-full text-center bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 transition-colors mb-3"
            >
              Upgrade Now
            </Link>
            <button onClick={handleClose} className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
              Maybe later
            </button>
          </div>
        ) : (
          <>
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    s <= step ? "bg-indigo-600" : "bg-neutral-200"
                  }`}
                />
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">What&apos;s it about?</h2>
                <p className="text-sm text-neutral-500 mb-6">Tell us about your presentation topic and audience.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Presentation topic <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Q3 Sales Results, Product Launch, Company Overview..."
                      rows={3}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Who&apos;s your audience?
                    </label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. Investors, Sales team, Potential customers"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!topic.trim()}
                  className="mt-6 w-full bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Style &amp; Length</h2>
                <p className="text-sm text-neutral-500 mb-6">Choose the tone and how many slides you need.</p>

                <div className="mb-5">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Tone</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                          tone === t.value
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-neutral-200 text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                        }`}
                      >
                        <span className={tone === t.value ? "text-indigo-600" : "text-neutral-400"}>
                          {t.icon}
                        </span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Number of slides</p>
                  <div className="flex gap-2">
                    {SLIDE_COUNTS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setSlideCount(n)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                          slideCount === n
                            ? "border-indigo-500 bg-indigo-600 text-white"
                            : "border-neutral-200 text-neutral-700 hover:border-indigo-300"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-neutral-200 text-neutral-700 font-semibold rounded-xl py-3 hover:bg-neutral-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Review &amp; Generate</h2>
                <p className="text-sm text-neutral-500 mb-6">Everything look good? Let&apos;s create your presentation.</p>

                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">Topic</span>
                    <span className="text-sm text-neutral-800">{topic}</span>
                  </div>
                  {audience && (
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">Audience</span>
                      <span className="text-sm text-neutral-800">{audience}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-16 flex-shrink-0">Tone</span>
                    <span className="text-sm text-neutral-800 capitalize">{tone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-16 flex-shrink-0">Slides</span>
                    <span className="text-sm text-neutral-800">{slideCount}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-neutral-500">Our AI is crafting your slides...</p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 border border-neutral-200 text-neutral-700 font-semibold rounded-xl py-3 hover:bg-neutral-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="flex-1 bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 transition-colors"
                    >
                      Generate Presentation
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
