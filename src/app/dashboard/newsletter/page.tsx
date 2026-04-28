import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Mail, Lock, CheckCircle, Clock, Send } from "lucide-react";
import Link from "next/link";
import { ApproveButton } from "@/components/dashboard/ApproveButton";

type NewsletterStatus = "draft" | "pending_approval" | "approved" | "sent";

const statusConfig: Record<NewsletterStatus, { label: string; className: string; icon: React.ReactNode }> = {
  draft:            { label: "Draft",            className: "bg-neutral-100 text-neutral-500 border border-neutral-200",   icon: <Clock className="w-3 h-3" /> },
  pending_approval: { label: "Needs Approval",   className: "bg-amber-50 text-amber-700 border border-amber-200",          icon: <Mail className="w-3 h-3" /> },
  approved:         { label: "Approved",         className: "bg-blue-50 text-blue-700 border border-blue-200",             icon: <CheckCircle className="w-3 h-3" /> },
  sent:             { label: "Sent",             className: "bg-green-50 text-green-700 border border-green-200",          icon: <Send className="w-3 h-3" /> },
};

export default async function NewsletterPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .single();

  // Check if add-on is active
  const { data: addon } = await admin
    .from("client_addons")
    .select("id, status")
    .eq("client_id", client?.id ?? "")
    .eq("addon_key", "newsletter")
    .eq("status", "active")
    .maybeSingle();

  // Fetch newsletters
  const { data: newsletters } = await admin
    .from("newsletters")
    .select("id, subject, preview_text, body_html, body_text, status, sent_at, created_at, month_batch")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  const hasAddon = !!addon;
  const pending = newsletters?.filter(n => n.status === "pending_approval") ?? [];
  const others = newsletters?.filter(n => n.status !== "pending_approval") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Newsletter</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monthly AI-written newsletters sent to your audience on your behalf.
          </p>
        </div>
        {hasAddon && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            ✓ Add-on Active
          </span>
        )}
      </div>

      {!hasAddon ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-neutral-400" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Newsletter Add-on Required</h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
            Get a monthly AI-written newsletter drafted from your brand voice, ready for your approval before it goes out.
          </p>
          <Link
            href="/dashboard/addons"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors text-sm"
          >
            View Add-ons →
          </Link>
        </div>
      ) : !newsletters?.length ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <Mail className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-medium text-neutral-700">Your first newsletter is being drafted</p>
          <p className="text-sm text-neutral-400 mt-1">
            Your first monthly newsletter will be ready for approval within 48 hours.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending approval */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <h2 className="font-semibold text-neutral-900">Needs Your Approval</h2>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{pending.length}</span>
              </div>
              {pending.map((nl) => (
                <div key={nl.id} className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-amber-100 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-neutral-900">{nl.subject}</p>
                      {nl.preview_text && <p className="text-sm text-neutral-500 mt-0.5">{nl.preview_text}</p>}
                      <p className="text-xs text-neutral-400 mt-1">{nl.month_batch ?? new Date(nl.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                      <Mail className="w-3 h-3" /> Review
                    </span>
                  </div>
                  {nl.body_text && (
                    <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">{nl.body_text}</pre>
                    </div>
                  )}
                  <div className="px-6 py-4">
                    <ApproveButton type="post" id={nl.id} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past newsletters */}
          {others.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-neutral-900">Newsletter History</h2>
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm divide-y divide-neutral-100 overflow-hidden">
                {others.map((nl) => {
                  const status = (nl.status ?? "draft") as NewsletterStatus;
                  const cfg = statusConfig[status] ?? statusConfig.draft;
                  return (
                    <div key={nl.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{nl.subject}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {nl.sent_at
                            ? `Sent ${new Date(nl.sent_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                            : nl.month_batch ?? new Date(nl.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.className}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {hasAddon && (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-primary-900 mb-1">How your newsletter works</p>
          <ul className="space-y-1.5 text-xs text-primary-700">
            <li>• Each month we draft a newsletter from your brand voice and content brief</li>
            <li>• You review and approve it here before it goes out</li>
            <li>• Once approved, we send it to your email list automatically</li>
            <li>• You can connect your email list in Settings</li>
          </ul>
        </div>
      )}
    </div>
  );
}
