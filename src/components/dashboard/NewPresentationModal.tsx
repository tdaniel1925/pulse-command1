"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TemplateId, DeckMode, NarrativeFramework } from "@/lib/presentation-templates";
import { getAllTemplates, narrativeFrameworks } from "@/lib/presentation-templates";

interface Props {
  open: boolean;
  onClose: () => void;
  presentationsUsed: number;
  presentationsLimit: number;
}

type Tone = "professional" | "inspiring" | "educational" | "casual";
type SourceMode = "ai" | "paste" | "url" | "interview";

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

const INTERVIEW_QUESTIONS = [
  "What is this presentation for?",
  "Who is your audience and what do they care about?",
  "What is the ONE thing they must walk away knowing?",
  "What proof points, stats, or results can you share?",
  "What do you want them to DO after seeing this?",
];

const MODE_CARDS: {
  value: SourceMode;
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "ai",
    title: "Start from a Topic",
    subtitle: "Tell AI what you need — it handles the rest",
    badge: "Most popular",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    value: "paste",
    title: "Paste Your Content",
    subtitle: "Drop in notes, a doc, or bullet points",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
      </svg>
    ),
  },
  {
    value: "url",
    title: "Import from Website",
    subtitle: "Point to your site and we'll build from it",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    value: "interview",
    title: "AI Interview",
    subtitle: "Answer 5 questions, get a custom deck",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
];

const DECK_MODE_CARDS: { value: DeckMode; emoji: string; name: string; desc: string }[] = [
  { value: "standard", emoji: "📊", name: "Standard", desc: "Balanced" },
  { value: "nano", emoji: "⚡", name: "Nano", desc: "One idea/slide" },
  { value: "infographic", emoji: "📈", name: "Infographic", desc: "Data-visual" },
  { value: "document", emoji: "📄", name: "Document", desc: "Dense detail" },
  { value: "story", emoji: "🎬", name: "Story", desc: "Visual-first" },
];

export function NewPresentationModal({ open, onClose, presentationsUsed, presentationsLimit }: Props) {
  const router = useRouter();
  // Step 0 = mode select, 1 = content, 2 = template & narrative, 3 = style, 4 = review
  const [step, setStep] = useState(0);
  const [sourceMode, setSourceMode] = useState<SourceMode>("ai");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [slideCount, setSlideCount] = useState(10);
  const [sourceContent, setSourceContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [templateId, setTemplateId] = useState<TemplateId>("pitch");
  const [narrativeFramework, setNarrativeFramework] = useState<NarrativeFramework>("free");
  const [deckMode, setDeckMode] = useState<DeckMode>("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const atLimit = presentationsUsed >= presentationsLimit;
  const allTemplates = getAllTemplates();
  const allNarrativeFrameworks = (Object.entries(narrativeFrameworks) as [NarrativeFramework, { name: string; description: string; slideFlow: string }][]).map(
    ([id, val]) => ({ id, ...val })
  );

  function handleClose() {
    setStep(0);
    setSourceMode("ai");
    setTopic("");
    setAudience("");
    setTone("professional");
    setSlideCount(10);
    setSourceContent("");
    setSourceUrl("");
    setInterviewAnswers({});
    setTemplateId("pitch");
    setNarrativeFramework("free");
    setDeckMode("standard");
    setLoading(false);
    setError(null);
    setShowUpgrade(false);
    onClose();
  }

  function step1Valid(): boolean {
    if (sourceMode === "ai") return topic.trim().length > 0;
    if (sourceMode === "paste") return sourceContent.trim().length > 0;
    if (sourceMode === "url") return sourceUrl.trim().length > 0;
    if (sourceMode === "interview") {
      return INTERVIEW_QUESTIONS.every((q) => (interviewAnswers[q] ?? "").trim().length > 0);
    }
    return false;
  }

  function resolvedTopic(): string {
    if (sourceMode === "ai") return topic;
    if (sourceMode === "paste") return topic || "Presentation from provided content";
    if (sourceMode === "url") return topic || sourceUrl;
    if (sourceMode === "interview") {
      return interviewAnswers[INTERVIEW_QUESTIONS[0]] ?? "Presentation";
    }
    return topic;
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/presentations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: resolvedTopic(),
          audience,
          tone,
          slideCount,
          sourceMode,
          sourceContent: sourceMode === "paste" ? sourceContent : undefined,
          sourceUrl: sourceMode === "url" ? sourceUrl : undefined,
          interviewAnswers: sourceMode === "interview" ? interviewAnswers : undefined,
          templateId,
          narrativeFramework,
          deckMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "trial_exhausted") {
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

  // Total steps: 0, 1, 2, 3, 4 → show 5 dots
  const totalSteps = 5;

  // Helper to find deck mode label for review
  const selectedDeckModeCard = DECK_MODE_CARDS.find((c) => c.value === deckMode);
  const selectedTemplate = allTemplates.find((t) => t.id === templateId);
  const selectedNarrativeEntry = narrativeFrameworks[narrativeFramework];
  const selectedNarrativeName = selectedNarrativeEntry?.name ?? narrativeFramework;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-lg sm:max-w-lg relative max-h-[90vh] overflow-y-auto">
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
                {[
                  "Unlimited AI-generated presentations",
                  "Professional slide designs",
                  "Export to PowerPoint & PDF",
                  "Custom branding & themes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
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
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i <= step ? "bg-indigo-600" : "bg-neutral-200"
                  }`}
                />
              ))}
            </div>

            {/* ── STEP 0: Mode selection ── */}
            {step === 0 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">How do you want to create this?</h2>
                <p className="text-sm text-neutral-500 mb-6">Choose your starting point.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {MODE_CARDS.map((card) => {
                    const selected = sourceMode === card.value;
                    return (
                      <button
                        key={card.value}
                        onClick={() => setSourceMode(card.value)}
                        className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        )}
                        <span className={`mb-2 block ${selected ? "text-indigo-600" : "text-neutral-400"}`}>
                          {card.icon}
                        </span>
                        <p className={`text-sm font-semibold leading-tight mb-1 ${selected ? "text-indigo-700" : "text-neutral-800"}`}>
                          {card.title}
                        </p>
                        <p className="text-xs text-neutral-500 leading-snug">{card.subtitle}</p>
                        {card.badge && (
                          <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5">
                            {card.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* ── STEP 1: Content input (varies by mode) ── */}
            {step === 1 && (
              <div>
                {/* AI mode */}
                {sourceMode === "ai" && (
                  <>
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
                  </>
                )}

                {/* Paste mode */}
                {sourceMode === "paste" && (
                  <>
                    <h2 className="text-xl font-bold text-neutral-900 mb-1">Paste your content</h2>
                    <p className="text-sm text-neutral-500 mb-6">We&apos;ll turn your text into slides.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Your content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={sourceContent}
                          onChange={(e) => setSourceContent(e.target.value)}
                          placeholder="Paste your notes, document text, bullet points, or any content you want to turn into slides..."
                          rows={6}
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[200px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          What should we call this presentation? <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. Q3 Results, Product Overview..."
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  </>
                )}

                {/* URL mode */}
                {sourceMode === "url" && (
                  <>
                    <h2 className="text-xl font-bold text-neutral-900 mb-1">Import from website</h2>
                    <p className="text-sm text-neutral-500 mb-6">We&apos;ll read your site and build from it.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Website URL <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                          </span>
                          <input
                            type="url"
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full rounded-xl border border-neutral-200 pl-10 pr-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-neutral-400">
                          We&apos;ll read your homepage and key pages to extract your content.
                        </p>
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
                  </>
                )}

                {/* Interview mode */}
                {sourceMode === "interview" && (
                  <>
                    <h2 className="text-xl font-bold text-neutral-900 mb-1">Quick interview</h2>
                    <p className="text-sm text-neutral-500 mb-6">Answer 5 questions — we&apos;ll build your custom deck.</p>
                    <div className="space-y-4">
                      {INTERVIEW_QUESTIONS.map((q, i) => {
                        const isTextarea = i === 3;
                        return (
                          <div key={q}>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                              <span className="text-indigo-500 font-bold">Q{i + 1}.</span> {q}
                            </label>
                            {isTextarea ? (
                              <textarea
                                value={interviewAnswers[q] ?? ""}
                                onChange={(e) =>
                                  setInterviewAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                                }
                                rows={3}
                                placeholder="Share any data, results, or examples..."
                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={interviewAnswers[q] ?? ""}
                                onChange={(e) =>
                                  setInterviewAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                                }
                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 border border-neutral-200 text-neutral-700 font-semibold rounded-xl py-3 hover:bg-neutral-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!step1Valid()}
                    className="flex-1 bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Template & Narrative ── */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Template &amp; Structure</h2>
                <p className="text-sm text-neutral-500 mb-6">Choose a look and a storytelling framework.</p>

                {/* Section A: Template picker */}
                <p className="text-sm font-medium text-neutral-700 mb-2">Choose a Template</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {allTemplates.map((tmpl) => {
                    const selected = templateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        onClick={() => setTemplateId(tmpl.id)}
                        className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        )}
                        {/* Preview swatch */}
                        {tmpl.id === "obsidian" ? (
                          <div
                            className="h-16 rounded-lg mb-3 border border-neutral-700"
                            style={{ background: "#0F0F0F" }}
                          />
                        ) : (
                          <div className={`h-16 rounded-lg mb-3 border ${tmpl.previewGradient}`} />
                        )}
                        <p className={`text-sm font-semibold mb-0.5 ${selected ? "text-indigo-700" : "text-neutral-800"}`}>
                          {tmpl.name}
                        </p>
                        <p className="text-xs text-neutral-500 mb-1.5">{tmpl.vibe}</p>
                        <div className="flex flex-wrap gap-1">
                          {tmpl.bestFor.slice(0, 2).map((b) => (
                            <span
                              key={b}
                              className="text-[10px] bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Section B: Narrative Structure */}
                <p className="text-sm font-medium text-neutral-700 mb-2 mt-6">Narrative Structure</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {allNarrativeFrameworks.map((fw) => {
                    const selected = narrativeFramework === fw.id;
                    return (
                      <button
                        key={fw.id}
                        onClick={() => setNarrativeFramework(fw.id)}
                        className={`text-left rounded-xl border-2 p-3 transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        <p className={`text-sm font-medium mb-0.5 ${selected ? "text-indigo-700" : "text-neutral-800"}`}>
                          {fw.name}
                        </p>
                        <p className="text-xs text-neutral-400 leading-snug">{fw.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Section C: Deck Mode */}
                <p className="text-sm font-medium text-neutral-700 mb-1 mt-6">Presentation Style</p>
                <p className="text-xs text-neutral-400 mb-2">How should this deck feel?</p>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {DECK_MODE_CARDS.map((card) => {
                    const selected = deckMode === card.value;
                    return (
                      <button
                        key={card.value}
                        onClick={() => setDeckMode(card.value)}
                        className={`flex flex-col items-center text-center rounded-xl border-2 p-2 transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        <span className="text-lg mb-1">{card.emoji}</span>
                        <p className={`text-[11px] font-semibold leading-tight ${selected ? "text-indigo-700" : "text-neutral-800"}`}>
                          {card.name}
                        </p>
                        <p className="text-[9px] text-neutral-400 leading-tight mt-0.5">{card.desc}</p>
                      </button>
                    );
                  })}
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

            {/* ── STEP 3: Style & Length ── */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Style &amp; Length</h2>
                <p className="text-sm text-neutral-500 mb-6">Choose the tone and slide count.</p>

                {/* Tone */}
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

                {/* Slide count */}
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
                    onClick={() => setStep(2)}
                    className="flex-1 border border-neutral-200 text-neutral-700 font-semibold rounded-xl py-3 hover:bg-neutral-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Generate ── */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Review &amp; Generate</h2>
                <p className="text-sm text-neutral-500 mb-6">Everything look good? Let&apos;s create your presentation.</p>

                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-3 mb-6">
                  {/* Mode */}
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">Mode</span>
                    <span className="text-sm text-neutral-800 capitalize">
                      {MODE_CARDS.find((c) => c.value === sourceMode)?.title ?? sourceMode}
                    </span>
                  </div>
                  {/* Topic */}
                  {resolvedTopic() && (
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">Topic</span>
                      <span className="text-sm text-neutral-800 line-clamp-2">{resolvedTopic()}</span>
                    </div>
                  )}
                  {audience && (
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">Audience</span>
                      <span className="text-sm text-neutral-800">{audience}</span>
                    </div>
                  )}
                  {/* Template */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0">Template</span>
                    <span className="text-sm text-neutral-800">{selectedTemplate?.name ?? templateId}</span>
                  </div>
                  {/* Narrative */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0">Narrative</span>
                    <span className="text-sm text-neutral-800">{selectedNarrativeName}</span>
                  </div>
                  {/* Deck mode */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0">Deck style</span>
                    <span className="text-sm text-neutral-800">
                      {selectedDeckModeCard ? `${selectedDeckModeCard.emoji} ${selectedDeckModeCard.name}` : deckMode}
                    </span>
                  </div>
                  {/* Tone */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0">Tone</span>
                    <span className="text-sm text-neutral-800 capitalize">{tone}</span>
                  </div>
                  {/* Slides */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide w-20 flex-shrink-0">Slides</span>
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
                      onClick={() => setStep(3)}
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
