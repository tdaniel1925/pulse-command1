"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Sparkles, User } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  clientId: string;
}

type AspectRatio = "16:9" | "9:16";

interface AvatarOption {
  id: string;
  name: string;
  style: string;
}

const avatars: AvatarOption[] = [
  { id: "alex", name: "Alex", style: "Professional" },
  { id: "sarah", name: "Sarah", style: "Professional" },
  { id: "marcus", name: "Marcus", style: "Casual" },
  { id: "priya", name: "Priya", style: "Casual" },
];

export default function CreateVideoModal({ open, onClose, clientId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [generatingScript, setGeneratingScript] = useState(false);

  // Step 2
  const [avatarId, setAvatarId] = useState("alex");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");

  // Step 3
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep(1);
    setTopic("");
    setScript("");
    setAvatarId("alex");
    setAspectRatio("16:9");
    setSubmitting(false);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function generateScript() {
    if (!topic.trim()) return;
    setGeneratingScript(true);
    try {
      const res = await fetch("/api/videos/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.script) setScript(data.script);
    } catch {
      // silent fail — user can type manually
    } finally {
      setGeneratingScript(false);
    }
  }

  async function handleGenerate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/videos/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, script, avatarId, aspectRatio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      handleClose();
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="font-semibold text-neutral-900">Create AI Video</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-4 sm:px-6 pt-4 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-indigo-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Script */}
        {step === 1 && (
          <div className="px-4 sm:px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Video topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why your business needs a content strategy"
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Script
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write your script here, or generate one with AI below..."
                rows={8}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[200px]"
              />
              <button
                onClick={generateScript}
                disabled={generatingScript || !topic.trim()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 border border-violet-300 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {generatingScript ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate script with AI
              </button>
              <p className="text-xs text-neutral-400 mt-1">
                Or describe what you want and edit to fit your voice.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Presenter & Style */}
        {step === 2 && (
          <div className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Avatar
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {avatars.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setAvatarId(av.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${
                      avatarId === av.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{av.name}</p>
                      <p className="text-xs text-neutral-400">{av.style}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Aspect ratio
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {(["16:9", "9:16"] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`p-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                      aspectRatio === ratio
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                    }`}
                  >
                    {ratio === "16:9" ? "16:9 — Landscape" : "9:16 — Vertical / Reels"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Voice
              </label>
              <p className="text-sm text-neutral-500 bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-200">
                Default (matches avatar)
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Review & Generate */}
        {step === 3 && (
          <div className="px-6 py-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700">Review your video</h3>
            <div className="space-y-3 bg-neutral-50 rounded-xl p-4 text-sm">
              <div className="flex gap-2">
                <span className="text-neutral-400 w-24 flex-shrink-0">Topic</span>
                <span className="text-neutral-900 font-medium">{topic || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-400 w-24 flex-shrink-0">Script</span>
                <span className="text-neutral-700 line-clamp-2">
                  {script ? `${script.slice(0, 100)}${script.length > 100 ? "…" : ""}` : "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-400 w-24 flex-shrink-0">Avatar</span>
                <span className="text-neutral-900 font-medium capitalize">{avatarId}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-400 w-24 flex-shrink-0">Format</span>
                <span className="text-neutral-900 font-medium">
                  {aspectRatio === "16:9" ? "Landscape (16:9)" : "Vertical / Reels (9:16)"}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            {submitting && (
              <p className="text-xs text-neutral-500 text-center">
                Submitting to HeyGen… this takes 2–5 minutes.
              </p>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="px-4 sm:px-6 py-4 border-t border-neutral-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-4 py-2 rounded-xl hover:bg-neutral-100"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && (!topic.trim() || !script.trim())}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
