"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "write" | "preview";

export function ComposeButton({
  subscriberCount,
  businessName,
}: {
  subscriberCount: number;
  businessName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
      >
        + Compose
      </button>

      {open && (
        <ComposeModal
          subscriberCount={subscriberCount}
          businessName={businessName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ComposeModal({
  subscriberCount,
  businessName,
  onClose,
}: {
  subscriberCount: number;
  businessName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("write");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!topic) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, businessName, tone: "professional" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generate failed");
      setSubject(data.subject ?? "");
      setBody(data.html ?? data.text ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function saveNewsletter(status: "draft" | "sent" = "draft") {
    if (!subject) throw new Error("Subject is required");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body_html: body, body_text: body, status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Save failed");
    return data.id as string;
  }

  async function handleSaveDraft() {
    setSaving(true);
    setError("");
    try {
      await saveNewsletter("draft");
      setFeedback("Draft saved!");
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendNow() {
    setSending(true);
    setError("");
    setFeedback("");
    try {
      const newsletterId = await saveNewsletter("draft");
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Send failed");
      setFeedback(`Sent to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}!`);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Compose Newsletter</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 pt-4">
          {(["write", "preview"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg capitalize transition-colors ${
                tab === t
                  ? "bg-primary-600 text-white"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {tab === "write" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line..."
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What is this newsletter about?"
                  className="flex-1 border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating || !topic}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {generating ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    "✨"
                  )}
                  {generating ? "Generating..." : "Generate with AI"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={15}
                  placeholder="Write your newsletter content here, or use AI to generate it..."
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y font-sans"
                />
              </div>
            </>
          ) : (
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
              <div className="max-w-lg mx-auto bg-white border border-neutral-200 rounded-xl p-8 font-sans">
                {subject && (
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">{subject}</h2>
                )}
                {body ? (
                  <div
                    className="prose prose-sm max-w-none text-neutral-700"
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                ) : (
                  <p className="text-neutral-400 text-sm italic">Nothing to preview yet.</p>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {feedback && <p className="text-sm text-green-600 font-medium">{feedback}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-400">
            Will send to {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving || sending}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={handleSendNow}
              disabled={saving || sending || !subject}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
