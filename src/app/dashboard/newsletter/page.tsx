import { createClient } from "@/lib/supabase/server";
import { ComposeButton } from "@/components/dashboard/NewsletterComposer";

type NewsletterStatus = "draft" | "sent" | "scheduled";

const statusBadge: Record<NewsletterStatus, string> = {
  draft: "bg-neutral-100 text-neutral-500 border border-neutral-200",
  sent: "bg-green-100 text-green-700 border border-green-200",
  scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function NewsletterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name")
    .eq("user_id", user?.id ?? "")
    .single();

  const [{ data: newsletters }, { count: subscriberCount }] = await Promise.all([
    supabase
      .from("newsletters")
      .select("id, subject, status, recipient_count, sent_at, created_at")
      .eq("client_id", client?.id ?? "")
      .order("created_at", { ascending: false }),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("client_id", client?.id ?? "")
      .eq("status", "active"),
  ]);

  const items = newsletters ?? [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sentThisMonth = items.filter(
    (n) => n.status === "sent" && n.sent_at && new Date(n.sent_at) >= monthStart
  ).length;
  const lastSent = items.find((n) => n.status === "sent")?.sent_at;
  const subCount = subscriberCount ?? 0;
  const businessName = (client as { business_name?: string } | null)?.business_name ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Newsletter</h1>
          <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
            📧 {subCount} subscriber{subCount !== 1 ? "s" : ""}
          </span>
        </div>
        <ComposeButton subscriberCount={subCount} businessName={businessName} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Subscribers</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">{subCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Sent This Month</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{sentThisMonth}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Last Sent</p>
          <p className="text-xl font-bold text-neutral-700 mt-1">
            {lastSent ? formatDate(lastSent) : "Never"}
          </p>
        </div>
      </div>

      {/* Newsletters Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Your Newsletters</h2>
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-neutral-500">
              No newsletters yet. Compose your first one to start building your audience.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Subject</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Recipients</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Sent Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((nl) => {
                  const status = (nl.status ?? "draft") as NewsletterStatus;
                  const badgeClass = statusBadge[status] ?? statusBadge.draft;
                  return (
                    <tr key={nl.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-neutral-900">{nl.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{nl.recipient_count ?? 0}</td>
                      <td className="px-6 py-4 text-neutral-500">
                        {nl.sent_at ? formatDate(nl.sent_at) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
