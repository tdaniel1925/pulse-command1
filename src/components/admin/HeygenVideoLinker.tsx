"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Link2 } from "lucide-react";

export default function HeygenVideoLinker({ clientId }: { clientId: string }) {
  const [videoId, setVideoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleLink() {
    if (!videoId.trim() || saving) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/clients/${clientId}/link-heygen-video`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heygenVideoId: videoId.trim() }),
      });
      setSaved(true);
      setVideoId("");
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-neutral-400" />
        <h3 className="font-semibold text-neutral-900 text-sm">Link HeyGen Video</h3>
      </div>
      <p className="text-xs text-neutral-500">
        Paste a HeyGen video ID to link it to this client&apos;s latest pending video record.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={videoId}
          onChange={e => setVideoId(e.target.value)}
          placeholder="e.g. abc123def456..."
          className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 font-mono"
        />
        <button
          onClick={handleLink}
          disabled={!videoId.trim() || saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Link"}
        </button>
      </div>
      {saved && (
        <p className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
          <CheckCircle className="w-4 h-4" /> Video linked successfully!
        </p>
      )}
    </div>
  );
}
