"use client";

import { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  onClose: () => void;
}

export function AddClientModal({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    business_name: "",
    website: "",
    industry: "",
    status: "lead",
    assigned_to: "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.email) { setError("First name and email are required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create client");
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-neutral-900">Add New Client</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">First Name *</label>
              <input
                value={form.first_name}
                onChange={e => set("first_name", e.target.value)}
                placeholder="Jane"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Last Name</label>
              <input
                value={form.last_name}
                onChange={e => set("last_name", e.target.value)}
                placeholder="Smith"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="lead">Lead</option>
                <option value="onboarding">Onboarding</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="churned">Churned</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Business Name</label>
            <input
              value={form.business_name}
              onChange={e => set("business_name", e.target.value)}
              placeholder="Acme Corp"
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Website</label>
              <input
                value={form.website}
                onChange={e => set("website", e.target.value)}
                placeholder="https://acme.com"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Industry</label>
              <input
                value={form.industry}
                onChange={e => set("industry", e.target.value)}
                placeholder="Real Estate"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Assigned To</label>
            <input
              value={form.assigned_to}
              onChange={e => set("assigned_to", e.target.value)}
              placeholder="Team member name"
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
