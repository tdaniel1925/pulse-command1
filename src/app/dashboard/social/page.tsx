import { CheckCircle, Clock, FileEdit, AlertCircle, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ApproveButton } from "@/components/dashboard/ApproveButton";
import { AutoApproveToggle } from "@/components/dashboard/AutoApproveToggle";

const platformStyles: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  twitter: "bg-sky-100 text-sky-700",
  linkedin: "bg-blue-100 text-blue-800",
  tiktok: "bg-neutral-100 text-neutral-700",
};

const PlatformBadge = ({ platform }: { platform: string }) => (
  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${platformStyles[platform.toLowerCase()] ?? "bg-neutral-100 text-neutral-600"}`}>
    {platform}
  </span>
);

type PostStatus = "published" | "scheduled" | "draft" | "failed" | "pending_approval" | "rejected";

const statusConfig: Record<PostStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending_approval: { label: "Needs Approval", className: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Bell className="w-3 h-3" /> },
  published: { label: "Published", className: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
  scheduled: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border border-blue-200", icon: <Clock className="w-3 h-3" /> },
  draft: { label: "Draft", className: "bg-neutral-100 text-neutral-500 border border-neutral-200", icon: <FileEdit className="w-3 h-3" /> },
  rejected: { label: "Rejected", className: "bg-neutral-100 text-neutral-400 border border-neutral-200", icon: null },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border border-red-200", icon: <AlertCircle className="w-3 h-3" /> },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: client } = await supabase
    .from("clients")
    .select("id, auto_approve")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: posts } = await supabase
    .from("social_posts")
    .select("id, content, platforms, status, scheduled_at, published_at, image_url, performance")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  const pending = posts?.filter((p) => p.status === "pending_approval") ?? [];
  const published = posts?.filter((p) => p.status === "published").length ?? 0;
  const scheduled = posts?.filter((p) => p.status === "scheduled").length ?? 0;
  const draft = posts?.filter((p) => p.status === "draft").length ?? 0;
  const failed = posts?.filter((p) => p.status === "failed").length ?? 0;

  const stats = [
    { label: "Needs Approval", value: String(pending.length), className: pending.length > 0 ? "text-amber-600" : "text-neutral-900" },
    { label: "Published", value: String(published), className: "text-green-600" },
    { label: "Scheduled", value: String(scheduled), className: "text-blue-600" },
    { label: "Draft", value: String(draft), className: "text-neutral-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Social Posts</h1>
          <p className="text-sm text-neutral-500 mt-1">Your AI-generated content across all platforms.</p>
        </div>
        {client && (
          <AutoApproveToggle
            clientId={client.id}
            defaultValue={client.auto_approve ?? true}
          />
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-5 ${s.label === "Needs Approval" && pending.length > 0 ? "border-amber-200 bg-amber-50" : "border-neutral-200"}`}>
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.className}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending approval section */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-neutral-900">Needs Your Approval</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{pending.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {pending.map((post) => {
              const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
              return (
                <div key={post.id} className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 pt-4 flex gap-1.5">
                    {platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                    <span className="ml-auto text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Review
                    </span>
                  </div>
                  <div className="mx-4 mt-3 h-32 bg-neutral-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {post.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-neutral-400">No image</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <p className="text-sm text-neutral-700 line-clamp-3">{post.content}</p>
                    <ApproveButton type="post" id={post.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All posts */}
      {posts && posts.filter((p) => p.status !== "pending_approval").length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-neutral-900">All Posts</h2>
          <div className="grid grid-cols-3 gap-4">
            {posts.filter((p) => p.status !== "pending_approval").map((post) => {
              const status = (post.status ?? "draft") as PostStatus;
              const cfg = statusConfig[status] ?? statusConfig.draft;
              const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
              const dateDisplay = post.published_at
                ? formatDate(post.published_at)
                : formatDate(post.scheduled_at);
              return (
                <div key={post.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 pt-4 flex gap-1.5">
                    {platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                  </div>
                  <div className="mx-4 mt-3 h-32 bg-neutral-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {post.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-neutral-400">Image</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <p className="text-sm text-neutral-700 line-clamp-2">{post.content}</p>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <p className="text-xs text-neutral-400">{dateDisplay}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <CheckCircle className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-medium text-neutral-700">No posts yet</p>
          <p className="text-sm text-neutral-400 mt-1">Your first batch will arrive within 48 hours of onboarding.</p>
        </div>
      ) : null}

      {failed > 0 && (
        <p className="text-xs text-red-500">{failed} post{failed > 1 ? "s" : ""} failed to publish. Contact support.</p>
      )}
    </div>
  );
}
