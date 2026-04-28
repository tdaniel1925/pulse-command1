import { Play, CheckCircle, Loader2, Eye, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ApproveButton } from "@/components/dashboard/ApproveButton";

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  ready: { label: "Ready to Review", className: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Bell className="w-3 h-3" /> },
  approved: { label: "Approved", className: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
  rendering: { label: "Rendering", className: "bg-yellow-50 text-yellow-700 border border-yellow-200", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  processing: { label: "Processing", className: "bg-yellow-50 text-yellow-700 border border-yellow-200", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  published: { label: "Published", className: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Rejected", className: "bg-neutral-100 text-neutral-400 border border-neutral-200", icon: null },
};

function formatDate(dateStr: string | null, prefix: string): string {
  if (!dateStr) return "—";
  const formatted = new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${prefix} ${formatted}`;
}

export default async function VideosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, status, url, thumbnail_url, scheduled_at, published_at, script")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  const needsReview = videos?.filter((v) => v.status === "ready") ?? [];
  const rendering = videos?.filter((v) => v.status === "rendering" || v.status === "processing").length ?? 0;
  const approved = videos?.filter((v) => v.status === "approved" || v.status === "published").length ?? 0;
  const total = videos?.length ?? 0;

  const stats = [
    { label: "Needs Review", value: String(needsReview.length), className: needsReview.length > 0 ? "text-amber-600" : "text-neutral-900" },
    { label: "Rendering", value: String(rendering) },
    { label: "Approved", value: String(approved) },
    { label: "Total", value: String(total) },
  ];

  const isProcessing = (status: string) => status === "rendering" || status === "processing";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">AI Videos</h1>
        <p className="text-sm text-neutral-500 mt-1">HeyGen-powered videos generated from your content.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-5 ${s.label === "Needs Review" && needsReview.length > 0 ? "border-amber-200 bg-amber-50" : "border-neutral-200"}`}>
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`text-3xl font-bold text-neutral-900 mt-1 ${s.className ?? ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Needs review section */}
      {needsReview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-neutral-900">Ready for Your Review</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{needsReview.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {needsReview.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden flex flex-col">
                <div className="relative h-48 bg-neutral-800 flex items-center justify-center overflow-hidden">
                  {video.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  ) : null}
                  <div className="relative w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                  <span className="absolute top-3 right-3 text-xs font-semibold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                    Review
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="font-medium text-neutral-900 text-sm">{video.title}</p>
                  <div className="flex items-center gap-2">
                    {video.url && (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Watch
                      </a>
                    )}
                    <ApproveButton type="video" id={video.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other videos */}
      {videos && videos.filter((v) => v.status !== "ready").length > 0 && (
        <div className="space-y-3">
          {needsReview.length > 0 && <h2 className="font-semibold text-neutral-900">All Videos</h2>}
          <div className="grid grid-cols-2 gap-4">
            {videos.filter((v) => v.status !== "ready").map((video) => {
              const cfg = statusConfig[video.status ?? "processing"] ?? statusConfig.processing;
              const dateLabel = video.published_at
                ? formatDate(video.published_at, "Published")
                : video.scheduled_at
                  ? formatDate(video.scheduled_at, "Scheduled")
                  : "—";
              return (
                <div key={video.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {video.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    ) : null}
                    <div className="relative w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                    {isProcessing(video.status ?? "") && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
                          <p className="text-white text-xs mt-2 font-medium">Rendering…</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm">{video.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{dateLabel}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      {!isProcessing(video.status ?? "") && video.url && (
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!videos || videos.length === 0) && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <Play className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-medium text-neutral-700">No videos yet</p>
          <p className="text-sm text-neutral-400 mt-1">Your first AI video will be ready within 48 hours of onboarding.</p>
        </div>
      )}
    </div>
  );
}
