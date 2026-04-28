import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FileText, Download, Share2, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";

export default async function LeadMagnetPage() {
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
    .eq("addon_key", "lead_magnet")
    .eq("status", "active")
    .maybeSingle();

  // Fetch lead magnets
  const { data: leadMagnets } = await admin
    .from("lead_magnets")
    .select("id, title, subtitle, pdf_url, public_url, downloads, created_at")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  const hasAddon = !!addon;
  const hasMagnets = leadMagnets && leadMagnets.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lead Magnet</h1>
          <p className="text-sm text-neutral-500 mt-1">
            AI-generated PDF guides branded for your business — ready to share and capture leads.
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
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Lead Magnet Add-on Required</h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
            Unlock AI-generated PDF lead magnets branded for your business. Share them to capture leads across all your channels.
          </p>
          <Link
            href="/dashboard/addons"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors text-sm"
          >
            View Add-ons →
          </Link>
        </div>
      ) : !hasMagnets ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <FileText className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-medium text-neutral-700">Your lead magnet is being created</p>
          <p className="text-sm text-neutral-400 mt-1">
            Your first branded PDF guide will be ready within 48 hours.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {leadMagnets.map((lm) => (
            <div key={lm.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              {/* Preview banner */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 flex items-center justify-center">
                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <FileText className="w-10 h-10 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">{lm.title}</p>
                  {lm.subtitle && <p className="text-primary-200 text-xs mt-1">{lm.subtitle}</p>}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <p className="font-semibold text-neutral-900">{lm.title}</p>
                  {lm.subtitle && <p className="text-sm text-neutral-500 mt-0.5">{lm.subtitle}</p>}
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span>{lm.downloads ?? 0} downloads</span>
                  <span>Created {new Date(lm.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {lm.pdf_url && (
                    <a
                      href={lm.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </a>
                  )}
                  {lm.public_url && (
                    <a
                      href={lm.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Share Page
                    </a>
                  )}
                  {lm.public_url && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(lm.public_url!); }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Copy Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasAddon && (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-primary-900 mb-1">How to use your lead magnet</p>
          <ul className="space-y-1.5 text-xs text-primary-700">
            <li>• Share the PDF download link in your social posts and bio</li>
            <li>• Add it to your email signature</li>
            <li>• Post it as a free resource on LinkedIn and Facebook</li>
            <li>• Embed the share page link in your newsletter</li>
          </ul>
        </div>
      )}
    </div>
  );
}
