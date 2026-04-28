import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClientActions } from "@/components/admin/ClientActions";

const onboardingStepOrder = [
  { key: "signed_up", label: "Signed Up" },
  { key: "brand_assets_saved", label: "Brand Assets Set Up" },
  { key: "avatar_selected", label: "Avatar Selected" },
  { key: "voice_selected", label: "Voice Selected" },
  { key: "call_done", label: "Brand Interview Completed" },
  { key: "content_generating", label: "Content Generation Started" },
  { key: "active", label: "Active" },
];

const statusBadge: Record<string, string> = {
  lead: "bg-neutral-100 text-neutral-600",
  onboarding: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-orange-100 text-orange-700",
  churned: "bg-red-100 text-red-700",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch brand profile
  const { data: brandProfile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("client_id", id)
    .single();

  // Fetch recent activities
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const clientName = `${client?.first_name ?? "Unknown"} ${client?.last_name ?? ""}`.trim();
  const businessName = client?.business_name ?? "—";
  const clientStatus = client?.status ?? "lead";
  const currentStep = client?.onboarding_step ?? "";

  // Build onboarding steps with completion state
  const currentStepIdx = onboardingStepOrder.findIndex((s) => s.key === currentStep);
  const onboardingSteps = onboardingStepOrder.map((step, idx) => ({
    ...step,
    completed: currentStepIdx >= 0 ? idx <= currentStepIdx : false,
    current: step.key === currentStep,
  }));

  const contentPillars: string[] = brandProfile?.content_pillars ?? [];
  const keywords: string[] = brandProfile?.keywords ?? [];
  const priorityChannels: string[] = brandProfile?.priority_channels ?? [];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/clients"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mt-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Clients
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{clientName}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[clientStatus] ?? "bg-neutral-100 text-neutral-600"}`}>
                {clientStatus}
              </span>
            </div>
            <p className="text-neutral-500 text-sm mt-0.5">{businessName}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
          Assigned: {client?.assigned_to ?? "Unassigned"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 pb-0">
        {["Overview", "Timeline", "Content", "Settings"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "Overview"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column — 2/3 */}
        <div className="col-span-2 space-y-6">
          {/* Brand Profile */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-neutral-900">Brand Profile</h2>

            {brandProfile ? (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Business Description</p>
                  <p className="text-sm text-neutral-700">
                    {brandProfile.business_description ?? "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Unique Value Proposition</p>
                  <p className="text-sm text-neutral-700">
                    {brandProfile.unique_value_proposition ?? "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Target Audience</p>
                  <p className="text-sm text-neutral-700">
                    {brandProfile.target_audience ?? "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Tone of Voice</p>
                  <p className="text-sm text-neutral-700">{brandProfile.tone_of_voice ?? "—"}</p>
                </div>

                {contentPillars.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Content Pillars</p>
                    <div className="flex flex-wrap gap-2">
                      {contentPillars.map((p) => (
                        <span key={p} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg border border-primary-100 font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {keywords.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((k) => (
                        <span key={k} className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg font-medium">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {priorityChannels.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Priority Channels</p>
                    <div className="flex flex-wrap gap-2">
                      {priorityChannels.map((c) => (
                        <span key={c} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-100 font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">HeyGen Avatar</p>
                    <p className="text-sm text-neutral-700 font-mono">{brandProfile?.heygen_avatar_id ?? <span className="text-neutral-400 font-sans">Not selected</span>}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">ElevenLabs Voice</p>
                    <p className="text-sm text-neutral-700 font-mono">{brandProfile?.elevenlabs_voice_id ?? <span className="text-neutral-400 font-sans">Not selected</span>}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-400">No brand profile yet.</p>
            )}
          </div>

          {/* Onboarding Progress */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-5">Onboarding Progress</h2>
            <div className="space-y-3">
              {onboardingSteps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      step.current
                        ? "font-semibold text-primary-600"
                        : step.completed
                        ? "text-neutral-700"
                        : "text-neutral-400"
                    }`}
                  >
                    {idx + 1}. {step.label}
                    {step.current && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-5">
          {/* Client Info */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-900">Client Info</h2>
            {[
              ["Email", client?.email ?? "—"],
              ["Phone", client?.phone ?? "N/A"],
              ["Business", businessName],
              ["Website", client?.website ?? "—"],
              ["Industry", client?.industry ?? "—"],
              ["Created", client?.created_at
                ? new Date(client.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-xs text-neutral-500 flex-shrink-0">{label}</span>
                <span className="text-xs text-neutral-800 font-medium text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-900">Subscription</h2>
            {[
              ["Plan", client?.plan ?? "—"],
              ["Status", client?.subscription_status ?? "—"],
              ["Trial Ends", client?.trial_end
                ? new Date(client.trial_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "—"],
              ["Stripe ID", client?.stripe_customer_id ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-xs text-neutral-500 flex-shrink-0">{label}</span>
                <span
                  className={`text-xs font-medium text-right ${
                    label === "Status" ? "text-amber-600" : "text-neutral-800"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-neutral-900 mb-3">Quick Actions</h2>
            <ClientActions clientId={client?.id ?? ""} clientPhone={client?.phone} />
          </div>
        </div>
      </div>
    </div>
  );
}
