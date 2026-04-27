import {
  Share2,
  Video,
  Mic,
  Globe,
  Calendar,
  Download,
  User,
  GitBranch,
  CheckCircle,
  FileText,
  PlayCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const PlatformBadge = ({ platform }: { platform: string }) => {
  const styles: Record<string, string> = {
    Instagram: "bg-pink-100 text-pink-700",
    Facebook: "bg-blue-100 text-blue-700",
    Twitter: "bg-sky-100 text-sky-700",
    LinkedIn: "bg-blue-100 text-blue-800",
    TikTok: "bg-neutral-100 text-neutral-700",
    instagram: "bg-pink-100 text-pink-700",
    facebook: "bg-blue-100 text-blue-700",
    twitter: "bg-sky-100 text-sky-700",
    linkedin: "bg-blue-100 text-blue-800",
    tiktok: "bg-neutral-100 text-neutral-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${styles[platform] ?? "bg-neutral-100 text-neutral-600"}`}>
      {platform}
    </span>
  );
};

const quickActions = [
  { label: "View Social Calendar", icon: Calendar, color: "bg-blue-50 text-blue-700" },
  { label: "Download Report", icon: Download, color: "bg-neutral-100 text-neutral-700" },
  { label: "Update Profile", icon: User, color: "bg-neutral-100 text-neutral-700" },
  { label: "View Workflow", icon: GitBranch, color: "bg-violet-50 text-violet-700" },
];

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatScheduledDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

  const { count: publishedPosts } = await supabase
    .from("social_posts").select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "").eq("status", "published");

  const { count: scheduledPosts } = await supabase
    .from("social_posts").select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "").eq("status", "scheduled");

  const { data: upcomingPosts } = await supabase
    .from("social_posts").select("*")
    .eq("client_id", client?.id ?? "").eq("status", "scheduled")
    .order("scheduled_at", { ascending: true }).limit(3);

  const { data: recentActivities } = await supabase
    .from("activities").select("*")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false }).limit(5);

  const { count: videosReady } = await supabase
    .from("videos").select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "").eq("status", "ready");

  const { count: audioReady } = await supabase
    .from("audio_episodes").select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "").eq("status", "ready");

  const { count: activePages } = await supabase
    .from("landing_pages").select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "").eq("status", "live");

  const totalPosts = (publishedPosts ?? 0) + (scheduledPosts ?? 0);

  const stats = [
    { label: "Posts This Month", value: String(totalPosts), sub: "published + scheduled", icon: Share2, color: "text-blue-600 bg-blue-50" },
    { label: "Videos Ready", value: String(videosReady ?? 0), sub: "ready to view", icon: Video, color: "text-violet-600 bg-violet-50" },
    { label: "Audio Episodes", value: String(audioReady ?? 0), sub: "ready to listen", icon: Mic, color: "text-orange-600 bg-orange-50" },
    { label: "Active Landing Pages", value: String(activePages ?? 0), sub: "currently live", icon: Globe, color: "text-green-600 bg-green-50" },
  ];

  const firstName = client?.first_name ?? "there";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-primary-600 rounded-2xl px-6 py-5 text-white">
        <p className="text-lg font-bold">Good morning, {firstName}!</p>
        <p className="text-primary-200 text-sm mt-0.5">Your content machine is running.</p>
      </div>

      {/* Trial status card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-yellow-800 text-sm">You have 18 days left in your free trial</p>
          <p className="text-yellow-600 text-xs mt-0.5">Upgrade to keep your content flowing after May 15.</p>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
          Upgrade Now
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {s.value}
              <span className="text-sm font-normal text-neutral-400 ml-1">{s.sub}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* This Month's Content */}
        <div className="col-span-2 space-y-4">
          <h2 className="font-semibold text-neutral-900">Upcoming Scheduled Posts</h2>

          {upcomingPosts && upcomingPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {upcomingPosts.map((post) => {
                const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
                return (
                  <div key={post.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    {/* Image placeholder */}
                    <div className="h-28 bg-neutral-100 flex items-center justify-center">
                      {post.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Share2 className="w-6 h-6 text-neutral-300" />
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {/* Platform badges */}
                      <div className="flex gap-1 flex-wrap">
                        {platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                      </div>
                      <p className="text-xs text-neutral-700 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-neutral-400">{formatScheduledDate(post.scheduled_at)}</p>
                      <span className="inline-block text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
              <Share2 className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">No scheduled posts yet — your first batch will arrive within 48 hours of onboarding.</p>
            </div>
          )}

          {/* Quick Actions */}
          <h2 className="font-semibold text-neutral-900 pt-2">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-neutral-200 bg-white hover:shadow-sm transition-shadow text-center`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.color}`}>
                  <a.icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-medium text-neutral-700 leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="font-semibold text-neutral-900">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((item, i) => {
                // Pick icon based on activity type
                const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
                  post: { icon: CheckCircle, color: "text-green-600" },
                  video: { icon: PlayCircle, color: "text-violet-600" },
                  report: { icon: FileText, color: "text-blue-600" },
                  page: { icon: Globe, color: "text-green-600" },
                  audio: { icon: Mic, color: "text-orange-600" },
                };
                const typeKey = item.type ?? "post";
                const { icon: Icon, color } = iconMap[typeKey] ?? { icon: CheckCircle, color: "text-neutral-500" };
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                      {i < recentActivities.length - 1 && <div className="w-px flex-1 bg-neutral-100 mt-1" />}
                    </div>
                    <div className="pb-3 min-w-0">
                      <p className="text-xs text-neutral-700 leading-snug">{item.description ?? item.text}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(item.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-neutral-400 text-center py-4">No activity yet — check back after your first content batch.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
