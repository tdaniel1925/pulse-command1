import { CheckCircle, Clock, FileEdit, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

type PostStatus = "published" | "scheduled" | "draft" | "failed";

const statusConfig: Record<PostStatus, { label: string; className: string; icon: React.ReactNode }> = {
  published: { label: "Published", className: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
  scheduled: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border border-blue-200", icon: <Clock className="w-3 h-3" /> },
  draft: { label: "Draft", className: "bg-neutral-100 text-neutral-500 border border-neutral-200", icon: <FileEdit className="w-3 h-3" /> },
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
    .select("id")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: posts } = await supabase
    .from("social_posts")
    .select("id, content, platforms, status, scheduled_at, published_at, image_url, performance")
    .eq("client_id", client?.id ?? "")
    .order("scheduled_at", { ascending: false });

  const published = posts?.filter((p) => p.status === "published").length ?? 0;
  const scheduled = posts?.filter((p) => p.status === "scheduled").length ?? 0;
  const draft = posts?.filter((p) => p.status === "draft").length ?? 0;
  const failed = posts?.filter((p) => p.status === "failed").length ?? 0;

  const stats = [
    { label: "Published", value: String(published), className: "text-green-600" },
    { label: "Scheduled", value: String(scheduled), className: "text-blue-600" },
    { label: "Draft", value: String(draft), className: "text-neutral-500" },
    { label: "Failed", value: String(failed), className: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Social Posts</h1>
          <p className="text-sm text-neutral-500 mt-1">Your AI-generated content across all platforms.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
            Content Calendar
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.className}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Posts grid */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {posts.map((post) => {
            const status = (post.status ?? "draft") as PostStatus;
            const cfg = statusConfig[status] ?? statusConfig.draft;
            const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
            const dateDisplay = post.published_at
              ? formatDate(post.published_at)
              : formatDate(post.scheduled_at);
            return (
              <div key={post.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                {/* Platform icons row */}
                <div className="px-4 pt-4 flex gap-1.5">
                  {platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                </div>

                {/* Image placeholder */}
                <div className="mx-4 mt-3 h-32 bg-neutral-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-neutral-400">Image</span>
                  )}
                </div>

                {/* Content */}
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
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <CheckCircle className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-medium text-neutral-700">No posts yet</p>
          <p className="text-sm text-neutral-400 mt-1">Your first batch will arrive within 48 hours of onboarding.</p>
        </div>
      )}
    </div>
  );
}
