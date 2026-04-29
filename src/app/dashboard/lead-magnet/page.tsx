import { createClient } from "@/lib/supabase/server";
import { CreateLeadMagnetButton, CopyLinkButton, StatusToggleButton } from "@/components/dashboard/LeadMagnetManager";
import { ExternalLink } from "lucide-react";

type LeadMagnet = {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  landing_page_url: string | null;
  leads_count: number;
  status: string;
  created_at: string;
};

const statusBadge: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-500 border border-neutral-200",
  active: "bg-green-100 text-green-700 border border-green-200",
  archived: "bg-neutral-100 text-neutral-400 border border-neutral-200",
};

export default async function LeadMagnetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: leadMagnets } = await supabase
    .from("lead_magnets")
    .select("id, title, description, file_url, landing_page_url, leads_count, status, created_at")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  const items: LeadMagnet[] = leadMagnets ?? [];
  const totalCount = items.length;
  const activeCount = items.filter((lm) => lm.status === "active").length;
  const totalLeads = items.reduce((sum, lm) => sum + (lm.leads_count ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lead Magnets</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Capture email leads with downloadable resources
          </p>
        </div>
        <CreateLeadMagnetButton />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Lead Magnets</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Active Magnets</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center gap-2">
            <span className="text-purple-600">👤</span>
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Leads Captured</p>
          </div>
          <p className="text-3xl font-bold text-purple-700 mt-1">{totalLeads}</p>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">🧲</div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">No lead magnets yet</h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
            Create downloadable resources like guides, checklists, and templates to capture email leads from your audience.
          </p>
          <CreateLeadMagnetButton />
        </div>
      ) : (
        /* Lead Magnets Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((lm) => (
            <div
              key={lm.id}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 relative"
            >
              {/* Status badge */}
              <span
                className={`absolute top-4 right-4 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  statusBadge[lm.status] ?? statusBadge.draft
                }`}
              >
                {lm.status}
              </span>

              <div className="space-y-3 mt-1">
                <p className="font-semibold text-neutral-900 pr-16">{lm.title}</p>

                {lm.description && (
                  <p className="text-sm text-neutral-500 line-clamp-2">{lm.description}</p>
                )}

                <span className="inline-flex items-center gap-1 text-xs font-medium bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                  👤 {lm.leads_count ?? 0} leads
                </span>

                {lm.landing_page_url && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={lm.landing_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Landing Page
                    </a>
                    <CopyLinkButton url={lm.landing_page_url} />
                  </div>
                )}

                {/* Action row */}
                {lm.status !== "archived" && (
                  <div className="pt-1">
                    <StatusToggleButton id={lm.id} currentStatus={lm.status} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
