import { Check, Download, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BillingPortalButton } from "@/components/dashboard/BillingPortalButton";

const deliverables = [
  "AI-generated social media posts (daily across all platforms)",
  "Personalised AI video content via your HeyGen avatar",
  "Audio podcast episodes in your cloned voice via ElevenLabs",
  "Monthly performance & analytics report",
];

const invoices = [
  { date: "Apr 1, 2026", amount: "$745.00", status: "Paid" },
  { date: "Mar 1, 2026", amount: "$745.00", status: "Paid" },
  { date: "Feb 1, 2026", amount: "$745.00", status: "Paid" },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusBadgeClass(status: string | null): string {
  switch (status) {
    case "active": return "bg-green-50 text-green-700 border border-green-200";
    case "trialing": return "bg-blue-50 text-blue-700 border border-blue-200";
    case "past_due": return "bg-red-50 text-red-700 border border-red-200";
    case "canceled": return "bg-neutral-100 text-neutral-500 border border-neutral-200";
    default: return "bg-neutral-100 text-neutral-500 border border-neutral-200";
  }
}

function statusDotClass(status: string | null): string {
  switch (status) {
    case "active": return "bg-green-500";
    case "trialing": return "bg-blue-500";
    case "past_due": return "bg-red-500";
    default: return "bg-neutral-400";
  }
}

function statusLabel(status: string | null): string {
  switch (status) {
    case "active": return "Active";
    case "trialing": return "Trial";
    case "past_due": return "Past Due";
    case "canceled": return "Canceled";
    default: return status ?? "Unknown";
  }
}

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const planName = subscription?.plan_name ?? "PulseCommand";
  const planAmount = subscription?.amount ?? 745;
  const planInterval = subscription?.interval ?? "month";
  const subStatus = subscription?.status ?? null;
  const nextBillingDate = formatDate(subscription?.current_period_end ?? null);

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-neutral-900">Billing</h2>

      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Current Plan</p>
            <h3 className="text-xl font-bold text-neutral-900">{planName}</h3>
            <p className="text-3xl font-extrabold text-neutral-900 mt-2">
              ${planAmount}
              <span className="text-base font-medium text-neutral-400">/{planInterval}</span>
            </p>
          </div>
          {subStatus && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(subStatus)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(subStatus)}`} />
              {statusLabel(subStatus)}
            </span>
          )}
          {!subStatus && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500 border border-neutral-200">
              No subscription
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            {subscription?.current_period_end
              ? <>Next billing date: <span className="font-semibold text-neutral-700">{nextBillingDate}</span></>
              : <span className="text-neutral-400">No active billing period</span>
            }
          </p>
          <BillingPortalButton />
        </div>
      </div>

      {/* What's included */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">What&apos;s Included</h3>
        <ul className="flex flex-col gap-3">
          {deliverables.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-neutral-700">
              <span className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary-600" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {subscription?.card_brand && subscription?.card_last4
                  ? `${subscription.card_brand} ending in ${subscription.card_last4}`
                  : "Managed via Stripe"}
              </p>
              <p className="text-xs text-neutral-400">
                {subscription?.card_exp_month && subscription?.card_exp_year
                  ? `Expires ${String(subscription.card_exp_month).padStart(2, "0")} / ${String(subscription.card_exp_year).slice(-2)}`
                  : "Update via Manage Subscription"}
              </p>
            </div>
          </div>
          <BillingPortalButton label="Update" />
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Invoice History</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-semibold text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
              <th className="text-left pb-3">Date</th>
              <th className="text-left pb-3">Amount</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-right pb-3">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.date} className="border-b border-neutral-50 last:border-0">
                <td className="py-3 text-neutral-700">{inv.date}</td>
                <td className="py-3 font-medium text-neutral-800">{inv.amount}</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <BillingPortalButton label="Download" icon={<Download className="w-3 h-3" />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
