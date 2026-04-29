import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfileAnalyticsSummary, getPostEngagement } from "@/lib/ayrshare";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  linkedin: "bg-blue-100 text-blue-900",
  twitter: "bg-neutral-100 text-neutral-800",
  tiktok: "bg-neutral-100 text-neutral-700",
};

const PLATFORM_BAR_COLORS: Record<string, string> = {
  instagram: "bg-pink-500",
  facebook: "bg-blue-600",
  linkedin: "bg-blue-800",
  twitter: "bg-neutral-900",
  tiktok: "bg-neutral-700",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function ReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, ayrshare_profile_key")
    .eq("user_id", user?.id ?? "")
    .single();

  const profileKey: string | null = client?.ayrshare_profile_key ?? null;

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Fetch posts + analytics summary in parallel
  const [{ data: rawPosts }, analytics] = await Promise.all([
    supabase
      .from("social_posts")
      .select("id, status, platforms, image_url, content, published_at, scheduled_at, metadata, ayrshare_post_id")
      .eq("client_id", client?.id ?? "")
      .gte("created_at", ninetyDaysAgo)
      .order("created_at", { ascending: false }),
    profileKey
      ? getProfileAnalyticsSummary(profileKey)
      : Promise.resolve({ totalPosts: 0, totalEngagement: 0, platformBreakdown: {} }),
  ]);

  const posts = rawPosts ?? [];

  // Fetch engagement for published posts with ayrshare_post_id in parallel
  const publishedWithId = posts.filter(
    (p) => p.status === "published" && p.ayrshare_post_id && profileKey
  );

  const engagementMap: Record<string, { likes: number; comments: number; shares: number; impressions: number }> = {};

  if (profileKey && publishedWithId.length > 0) {
    const results = await Promise.all(
      publishedWithId.map((p) =>
        getPostEngagement(profileKey, p.ayrshare_post_id as string).then((eng) => ({
          id: p.id as string,
          eng,
        }))
      )
    );
    for (const { id, eng } of results) {
      engagementMap[id] = eng;
    }
  }

  // Compute stats
  const publishedThisMonth = posts.filter(
    (p) => p.status === "published" && p.published_at && p.published_at >= startOfMonth
  ).length;

  const pendingCount = posts.filter((p) => p.status === "pending_approval").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  // Top platform from published posts
  const platformCounts: Record<string, number> = {};
  for (const p of posts.filter((p) => p.status === "published")) {
    const plats: string[] = Array.isArray(p.platforms) ? p.platforms : [];
    for (const plat of plats) {
      platformCounts[plat] = (platformCounts[plat] ?? 0) + 1;
    }
  }
  const topPlatform =
    Object.keys(platformCounts).length > 0
      ? Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  // Next scheduled post
  const scheduledPosts = posts
    .filter((p) => p.status === "scheduled" && p.scheduled_at)
    .sort((a, b) => (a.scheduled_at! > b.scheduled_at! ? 1 : -1));
  const nextScheduled = scheduledPosts[0] ?? null;

  const publishedPosts = posts.filter((p) => p.status === "published");

  // Platform breakdown across ALL posts (all statuses)
  const allPlatformCounts: Record<string, number> = {};
  for (const p of posts) {
    const plats: string[] = Array.isArray(p.platforms) ? p.platforms : [];
    for (const plat of plats) {
      allPlatformCounts[plat] = (allPlatformCounts[plat] ?? 0) + 1;
    }
  }
  const maxPlatformCount = Math.max(...Object.values(allPlatformCounts), 1);

  const lastUpdated = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Performance Report</h1>
          <p className="text-sm text-neutral-500 mt-1">{monthLabel}</p>
        </div>
        <p className="text-xs text-neutral-400 mt-1">Last updated: {lastUpdated}</p>
      </div>

      {/* Connect banner */}
      {!profileKey && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
          <p className="text-sm text-amber-800">
            📊 Connect your social accounts to unlock engagement analytics
          </p>
          <Link
            href="/dashboard/settings"
            className="text-sm font-semibold text-amber-700 border border-amber-400 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Connect Now →
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Published This Month */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Published This Month</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{publishedThisMonth}</p>
        </div>
        {/* Total Engagement */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Engagement</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {profileKey ? analytics.totalEngagement.toLocaleString() : "--"}
          </p>
        </div>
        {/* Top Platform */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Top Platform</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {topPlatform ? capitalize(topPlatform) : "--"}
          </p>
        </div>
        {/* Pending Approval */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Pending Approval</p>
          <p className={`text-3xl font-bold mt-2 ${pendingCount > 0 ? "text-amber-600" : "text-neutral-400"}`}>
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Post performance table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Post Performance</h2>
          <span className="text-xs font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {publishedPosts.length}
          </span>
        </div>
        {publishedPosts.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-neutral-400">
            No published posts yet — your content will appear here once published.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
                  <th className="text-left px-6 py-3 font-medium">Image</th>
                  <th className="text-left px-4 py-3 font-medium">Caption</th>
                  <th className="text-left px-4 py-3 font-medium">Platforms</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Layout</th>
                  <th className="text-left px-4 py-3 font-medium">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {publishedPosts.map((post) => {
                  const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
                  const eng = engagementMap[post.id as string];
                  const layout = post.metadata?.layout as string | undefined;
                  const dateStr = post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={post.id as string} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-3">
                        {post.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.image_url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-sm text-neutral-700 line-clamp-2 leading-snug">
                          {post.content}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {platforms.map((plat) => (
                            <span
                              key={plat}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PLATFORM_COLORS[plat] ?? "bg-neutral-100 text-neutral-600"}`}
                            >
                              {plat === "instagram" ? "IG" : plat === "facebook" ? "FB" : plat === "linkedin" ? "LI" : plat === "twitter" ? "X" : plat.slice(0, 2).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-500 whitespace-nowrap">{dateStr}</td>
                      <td className="px-4 py-3">
                        {layout ? (
                          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                            {layout}
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {eng ? (
                          <span>👍 {eng.likes} 💬 {eng.comments}</span>
                        ) : (
                          <span className="text-neutral-300">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Platform breakdown */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">Platform Breakdown</h2>
        {Object.keys(allPlatformCounts).length === 0 ? (
          <p className="text-sm text-neutral-400">No platform data available yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(allPlatformCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([platform, count]) => {
                const barWidth = `${(count / maxPlatformCount) * 100}%`;
                const barColor = PLATFORM_BAR_COLORS[platform] ?? "bg-neutral-400";
                return (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600 w-20 flex-shrink-0 capitalize">
                      {platform}
                    </span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-2">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all`}
                        style={{ width: barWidth }}
                      />
                    </div>
                    <span className="text-sm text-neutral-500 w-10 text-right flex-shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Content summary */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <h2 className="font-semibold text-neutral-900 mb-2">Content Summary</h2>
        <p className="text-sm text-neutral-600">
          This month:{" "}
          <span className="font-medium text-green-700">{publishedThisMonth} published</span>
          {" · "}
          <span className="font-medium text-blue-700">{scheduledCount} scheduled</span>
          {" · "}
          <span className="font-medium text-amber-700">{pendingCount} pending approval</span>
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          {nextScheduled && nextScheduled.scheduled_at
            ? `Next post scheduled: ${new Date(nextScheduled.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`
            : "No posts scheduled"}
        </p>
      </div>
    </div>
  );
}
