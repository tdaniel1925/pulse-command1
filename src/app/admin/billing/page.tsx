import { ExternalLink, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type SubStatus = "active" | "trialing" | "past_due" | "canceled";

const statusConfig: Record<SubStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-50 text-green-700 border border-green-200" },
  trialing: { label: "Trialing", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  past_due: { label: "Past Due", className: "bg-red-50 text-red-700 border border-red-200" },
  canceled: { label: "Canceled", className: "bg-neutral-100 text-neutral-500 border border-neutral-200" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id, client_id, plan, price, status, trial_end, current_period_end, stripe_subscription_id, clients(first_name, last_name, business_name)")
    .order("created_at", { ascending: false });

  const subRows = subscriptions ?? [];

  const activeCount = subRows.filter((s) => s.status === "active").length;
  const trialingCount = subRows.filter((s) => s.status === "trialing").length;
  const pastDueCount = subRows.filter((s) => s.status === "past_due").length;
  const pastDue = subRows.filter((s) => s.status === "past_due");

  const stats = [
    { label: "Total Revenue MTD", value: "$13,410" }, // TODO: compute from subscriptions
    { label: "Active Subscriptions", value: String(activeCount) },
    { label: "Trialing", value: String(trialingCount) },
    { label: "Past Due", value: String(pastDueCount) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Billing</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage client subscriptions and revenue.</p>
        </div>
        <span className="ml-auto inline-flex items-center bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          MRR: $13,410
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">All Subscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left font-medium text-neutral-500 px-6 py-3">Client</th>
                <th className="text-left font-medium text-neutral-500 px-4 py-3">Plan</th>
                <th className="text-left font-medium text-neutral-500 px-4 py-3">Amount</th>
                <th className="text-left font-medium text-neutral-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-neutral-500 px-4 py-3">Trial End / Next Bill</th>
                <th className="text-left font-medium text-neutral-500 px-4 py-3">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {subRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-400">
                    No subscriptions yet.
                  </td>
                </tr>
              ) : (
                subRows.map((sub, i) => {
                  const subStatus = (sub.status ?? "active") as SubStatus;
                  const cfg = statusConfig[subStatus] ?? statusConfig.canceled;
                  const clientData = (sub as any).clients;
                  const clientName = clientData?.business_name
                    ?? (clientData?.first_name && clientData?.last_name
                      ? `${clientData.first_name} ${clientData.last_name}`
                      : "Unknown Client");
                  const billingDate = sub.trial_end ?? sub.current_period_end ?? null;
                  const stripeUrl = sub.stripe_subscription_id
                    ? `https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`
                    : "#";
                  return (
                    <tr key={sub.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${i === subRows.length - 1 ? "border-0" : ""}`}>
                      <td className="px-6 py-4 font-medium text-neutral-900">{clientName}</td>
                      <td className="px-4 py-4 text-neutral-600">{sub.plan ?? "—"}</td>
                      <td className="px-4 py-4 text-neutral-900 font-medium">
                        {sub.price != null ? `$${(sub.price / 100).toFixed(2)}/mo` : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-neutral-500">
                        {formatDate(billingDate)}
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={stripeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Due section */}
      {pastDue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-800">Past Due Accounts</h2>
          </div>
          <div className="space-y-2">
            {pastDue.map((sub) => {
              const clientData = (sub as any).clients;
              const clientName = clientData?.business_name
                ?? (clientData?.first_name && clientData?.last_name
                  ? `${clientData.first_name} ${clientData.last_name}`
                  : "Unknown Client");
              const billingDate = sub.current_period_end ? formatDate(sub.current_period_end) : "—";
              const amount = sub.price != null ? `$${(sub.price / 100).toFixed(2)}/mo` : "—";
              const stripeUrl = sub.stripe_subscription_id
                ? `https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`
                : "#";
              return (
                <div key={sub.id} className="flex items-center justify-between bg-white rounded-xl border border-red-200 px-4 py-3">
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{clientName}</p>
                    <p className="text-xs text-neutral-500">{sub.plan ?? "—"} — {amount} — Due {billingDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">
                      Retry Charge
                    </button>
                    <a href={stripeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 border border-neutral-200 rounded-lg bg-white">
                      Stripe <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
