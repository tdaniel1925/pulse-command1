import Link from "next/link";
import { FileText, Film, User, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";

// ── helpers ────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "None scheduled";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PLATFORM_STYLES: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  twitter: "bg-sky-100 text-sky-700",
  linkedin: "bg-blue-100 text-blue-800",
  tiktok: "bg-neutral-100 text-neutral-700",
};

function PlatformPill({ platform }: { platform: string }) {
  const key = platform.toLowerCase();
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${PLATFORM_STYLES[key] ?? "bg-neutral-100 text-neutral-600"}`}
    >
      {platform}
    </span>
  );
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  post: FileText,
  video: Film,
  onboarding: User,
};

// ── page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, status, created_at")
    .eq("user_id", user?.id ?? "")
    .single();

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-neutral-600 text-lg">Your account setup isn't complete yet.</p>
        <Link
          href="/onboarding/welcome"
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Complete Onboarding →
        </Link>
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: publishedCount },
    { count: pendingCount },
    { data: nextPostArr },
    { data: lastPostArr },
    { data: activities },
  ] = await Promise.all([
    supabase
      .from("social_posts")
      .select("id", { count: "exact" })
      .eq("client_id", client.id)
      .eq("status", "published")
      .gte("created_at", startOfMonth),
    supabase
      .from("social_posts")
      .select("id", { count: "exact" })
      .eq("client_id", client.id)
      .eq("status", "pending_approval"),
    supabase
      .from("social_posts")
      .select("id, scheduled_at, platforms")
      .eq("client_id", client.id)
      .eq("status", "scheduled")
      .gte("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1),
    supabase
      .from("social_posts")
      .select("id, content, image_url, platforms, status, published_at, metadata")
      .eq("client_id", client.id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1),
    supabase
      .from("activities")
      .select("id, type, title, description, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const nextPost = nextPostArr?.[0] ?? null;
  const lastPost = lastPostArr?.[0] ?? null;

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const businessName = client.business_name ?? "there";

  return (
    <div className="space-y-6">
      {/* Welcome banner (client component) */}
      <WelcomeBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {greeting}, {businessName}
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Posts This Month */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Posts This Month</p>
          <p className="text-3xl font-bold text-blue-600">{publishedCount ?? 0}</p>
          <p className="text-xs text-neutral-400 mt-1">published</p>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Pending Approval</p>
          <p className={`text-3xl font-bold ${(pendingCount ?? 0) > 0 ? "text-amber-500" : "text-neutral-400"}`}>
            {pendingCount ?? 0}
          </p>
          {(pendingCount ?? 0) > 0 ? (
            <Link href="/dashboard/social" className="text-xs text-amber-600 underline mt-1 block">
              Review now →
            </Link>
          ) : (
            <p className="text-xs text-neutral-400 mt-1">none waiting</p>
          )}
        </div>

        {/* Next Post */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Next Post</p>
          <p className="text-sm font-semibold text-blue-600 mt-1">
            {nextPost ? formatDate(nextPost.scheduled_at) : "None scheduled"}
          </p>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Account Status</p>
          {client.status === "active" ? (
            <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              Active
            </span>
          ) : (
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                Setup needed
              </span>
              <Link href="/onboarding/welcome" className="text-xs text-amber-600 underline block">
                Complete setup →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Last post preview */}
      {lastPost && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
              {lastPost.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lastPost.image_url} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-sm text-neutral-700 line-clamp-2">{lastPost.content}</p>
              <div className="flex gap-1 flex-wrap">
                {(Array.isArray(lastPost.platforms) ? lastPost.platforms : []).map((p: string) => (
                  <PlatformPill key={p} platform={p} />
                ))}
              </div>
              <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Published
              </span>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Link href="/dashboard/social" className="text-xs text-indigo-600 font-medium hover:underline">
              View all posts →
            </Link>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Recent Activity</h2>
        {activities && activities.length > 0 ? (
          <ul className="space-y-3">
            {activities.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type ?? ""] ?? Zap;
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-neutral-500">{item.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 flex-shrink-0 mt-0.5">
                    {relativeTime(item.created_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400 text-center py-4">
            No activity yet — your first post is on its way.
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/social"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Social Posts
        </Link>
        <Link
          href="/dashboard/settings"
          className="px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-semibold rounded-xl transition-colors"
        >
          Connect Accounts
        </Link>
        <Link
          href="/dashboard/report"
          className="px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-semibold rounded-xl transition-colors"
        >
          View Report
        </Link>
      </div>
    </div>
  );
}
