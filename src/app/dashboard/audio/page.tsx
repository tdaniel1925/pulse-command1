import { Mic, CheckCircle, Loader2, Clock, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type AudioStatus = "published" | "processing" | "ready";
type AudiogramStatus = "ready" | "generating" | "none";

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  published: { label: "Published", className: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
  ready: { label: "Ready", className: "bg-blue-50 text-blue-700 border border-blue-200", icon: <CheckCircle className="w-3 h-3" /> },
  processing: { label: "Processing", className: "bg-yellow-50 text-yellow-700 border border-yellow-200", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
};

const audiogramConfig: Record<AudiogramStatus, { label: string; className: string }> = {
  ready: { label: "Audiogram Ready", className: "text-green-600" },
  generating: { label: "Audiogram Generating…", className: "text-yellow-600" },
  none: { label: "No Audiogram", className: "text-neutral-400" },
};

function deriveAudiogramStatus(audiogramUrl: string | null): AudiogramStatus {
  if (!audiogramUrl) return "none";
  if (audiogramUrl === "generating") return "generating";
  return "ready";
}

function formatDate(dateStr: string | null, prefix: string): string {
  if (!dateStr) return "—";
  const formatted = new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${prefix} ${formatted}`;
}

export default async function AudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: episodes } = await supabase
    .from("audio_episodes")
    .select("id, title, status, url, audiogram_url, scheduled_at, published_at")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Audio Episodes</h1>
        <p className="text-sm text-neutral-500 mt-1">ElevenLabs-generated audio clips and podcast-style episodes.</p>
      </div>

      {/* Episodes list */}
      {episodes && episodes.length > 0 ? (
        <div className="space-y-3">
          {episodes.map((ep) => {
            const status = (ep.status ?? "processing") as AudioStatus;
            const statusCfg = statusConfig[status] ?? statusConfig.processing;
            const audiogramStatus = deriveAudiogramStatus(ep.audiogram_url);
            const audioCfg = audiogramConfig[audiogramStatus];
            const dateLabel = ep.published_at
              ? formatDate(ep.published_at, "Published")
              : ep.scheduled_at
                ? formatDate(ep.scheduled_at, "Scheduled")
                : "—";
            return (
              <div key={ep.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex items-center gap-5">
                {/* Waveform icon area */}
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-orange-500" />
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 text-sm">{ep.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {/* Duration placeholder — not in schema */}
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                      <Clock className="w-3 h-3" />
                      —
                    </span>
                    {/* Audiogram status */}
                    <span className={`inline-flex items-center gap-1 text-xs ${audioCfg.className}`}>
                      <ImageIcon className="w-3 h-3" />
                      {audioCfg.label}
                    </span>
                    <span className="text-xs text-neutral-400">{dateLabel}</span>
                  </div>
                </div>

                {/* Status badge + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.className}`}>
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                  {status !== "processing" && ep.url && (
                    <a
                      href={ep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Listen
                    </a>
                  )}
                  {status !== "processing" && !ep.url && (
                    <button className="text-xs font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors">
                      Listen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <Mic className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-medium text-neutral-700">No audio episodes yet</p>
          <p className="text-sm text-neutral-400 mt-1">Your first episode will be ready within 48 hours of onboarding.</p>
        </div>
      )}
    </div>
  );
}
