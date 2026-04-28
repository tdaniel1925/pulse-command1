"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUSES = ["lead", "onboarding", "active", "paused", "churned"];
const STEPS = [
  "signed_up",
  "brand_assets_saved",
  "avatar_selected",
  "voice_selected",
  "call_done",
  "content_generating",
  "active",
];

interface Props {
  clientId: string;
  currentStatus: string;
  currentStep: string;
}

export function ClientStatusEditor({ clientId, currentStatus, currentStep }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [step, setStep] = useState(currentStep);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/clients/${clientId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, onboarding_step: step }),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-neutral-500 mb-1">Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUSES.map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-500 mb-1">Onboarding Step</label>
        <select
          value={step}
          onChange={e => setStep(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STEPS.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {saving
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
          : saved
          ? <><Check className="w-3.5 h-3.5" /> Saved!</>
          : "Save Changes"}
      </button>
    </div>
  );
}
