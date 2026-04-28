"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  clientId: string;
  defaultValue: boolean;
}

export function AutoApproveToggle({ clientId, defaultValue }: Props) {
  const [enabled, setEnabled] = useState(defaultValue);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    try {
      await fetch("/api/clients/auto-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, autoApprove: next }),
      });
      setEnabled(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">Auto-Approve Posts</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {enabled
            ? "Posts go straight to scheduled — no review needed."
            : "Posts land in your approval queue before publishing."}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        aria-pressed={enabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AABCF] disabled:opacity-60 ${
          enabled ? "bg-[#1AABCF]" : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
        {saving && (
          <Loader2 className="absolute -right-5 w-3.5 h-3.5 text-neutral-400 animate-spin" />
        )}
      </button>
    </div>
  );
}
