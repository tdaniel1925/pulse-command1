"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, Copy, ExternalLink, UserPlus } from "lucide-react";
import { AdminCardEntry } from "@/components/admin/AdminCardEntry";

type Billing = "comp" | "checkout" | "card";

interface ProvisionResult {
  clientId: string;
  userId: string;
  billing: Billing;
  checkoutUrl: string | null;
  setupClientSecret: string | null;
  publishableKey: string | null;
  seededPosts: number;
  tempPassword?: string;
}

const input = "w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export default function NewClientPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", businessName: "", phone: "",
    password: "", billing: "checkout" as Billing, trialDays: 14, seedPosts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [cardDone, setCardDone] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function provision() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/provision-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          businessName: form.businessName.trim() || undefined,
          phone: form.phone.trim() || undefined,
          password: form.password.trim() || undefined,
          billing: form.billing,
          trialDays: Number(form.trialDays) || 0,
          seedPosts: Number(form.seedPosts) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Provisioning failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to clients
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2 mb-1">
        <UserPlus className="w-5 h-5 text-neutral-700" /> New client
      </h1>
      <p className="text-sm text-neutral-500 mb-8">Create the account, set up their plan, and handle billing.</p>

      {!result ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">First name</label>
              <input className={input} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Jane" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Last name</label>
              <input className={input} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Smith" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
            <input className={input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Business name</label>
              <input className={input} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Acme Co." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Phone <span className="font-normal text-neutral-400">(optional)</span></label>
              <input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555…" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Temp password <span className="font-normal text-neutral-400">(optional — auto-generated if blank)</span></label>
            <input className={input} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="leave blank to auto-generate" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Trial days</label>
              <input className={input} type="number" min={0} value={form.trialDays} onChange={(e) => set("trialDays", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Seed draft posts</label>
              <input className={input} type="number" min={0} max={5} value={form.seedPosts} onChange={(e) => set("seedPosts", Number(e.target.value))} />
            </div>
          </div>

          {/* Billing mode */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2">Billing</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "checkout", label: "Send checkout link", desc: "Email them a Stripe link" },
                { id: "card", label: "Enter card now", desc: "MOTO via Stripe" },
                { id: "comp", label: "Comp / manual", desc: "No charge" },
              ] as const).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => set("billing", b.id)}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    form.billing === b.id ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10" : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <span className="block text-sm font-semibold text-neutral-900">{b.label}</span>
                  <span className="block text-xs text-neutral-500 mt-0.5">{b.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={provision}
            disabled={loading || !form.email || !form.firstName || !form.lastName}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <>Create client</>}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="w-5 h-5" /> Client created
          </div>

          <div className="text-sm text-neutral-600 space-y-1">
            <p>Client ID: <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">{result.clientId}</code></p>
            {result.seededPosts > 0 && <p>{result.seededPosts} draft post(s) generated.</p>}
            {result.tempPassword && (
              <p className="flex items-center gap-2">
                Temp password: <code className="text-xs bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">{result.tempPassword}</code>
                <button onClick={() => navigator.clipboard.writeText(result.tempPassword!)} className="text-neutral-400 hover:text-neutral-700"><Copy className="w-3.5 h-3.5" /></button>
              </p>
            )}
          </div>

          {/* Billing follow-up */}
          {result.billing === "checkout" && result.checkoutUrl && (
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-sm font-semibold text-neutral-800 mb-2">Send this checkout link to the client:</p>
              <div className="flex items-center gap-2">
                <input readOnly value={result.checkoutUrl} className="flex-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-neutral-50" />
                <button onClick={() => navigator.clipboard.writeText(result.checkoutUrl!)} className="p-2 text-neutral-500 hover:text-neutral-800" title="Copy"><Copy className="w-4 h-4" /></button>
                <a href={result.checkoutUrl} target="_blank" rel="noreferrer" className="p-2 text-neutral-500 hover:text-neutral-800" title="Open"><ExternalLink className="w-4 h-4" /></a>
              </div>
            </div>
          )}

          {result.billing === "card" && result.setupClientSecret && result.publishableKey && !cardDone && (
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-sm font-semibold text-neutral-800 mb-3">Enter the client&apos;s card</p>
              <AdminCardEntry
                clientId={result.clientId}
                clientSecret={result.setupClientSecret}
                publishableKey={result.publishableKey}
                onDone={() => setCardDone(true)}
              />
            </div>
          )}

          {result.billing === "comp" && (
            <p className="text-sm text-neutral-600 border-t border-neutral-100 pt-4">Marked as comped — no charge will be collected.</p>
          )}

          <div className="flex gap-3 pt-2">
            <Link href={`/admin/clients/${result.clientId}`} className="px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800">
              View client
            </Link>
            <button onClick={() => { setResult(null); setCardDone(false); }} className="px-4 py-2 border border-neutral-200 text-sm font-semibold rounded-xl hover:bg-neutral-50">
              Add another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
