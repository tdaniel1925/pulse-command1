import { Download, Share2, Video, Mic, Globe, Users, TrendingUp, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const chartSections = [
  { label: "Posts Published by Week" },
  { label: "Reach & Engagement Over Time" },
  { label: "Platform Breakdown" },
  { label: "Leads by Source" },
];

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("client_id", client?.id ?? "")
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(1)
    .single();

  const reportData = report?.data ?? null;

  // Map report month/year to display label
  const monthLabel = report
    ? new Date(report.year, report.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const summaryStats = reportData
    ? [
        { label: "Posts Published", value: String(reportData.posts_published ?? "—"), icon: Share2, color: "text-blue-600 bg-blue-50" },
        { label: "Total Reach", value: reportData.total_reach != null ? Number(reportData.total_reach).toLocaleString() : "—", icon: Users, color: "text-violet-600 bg-violet-50" },
        { label: "Video Views", value: reportData.video_views != null ? Number(reportData.video_views).toLocaleString() : "—", icon: Video, color: "text-pink-600 bg-pink-50" },
        { label: "Audio Listens", value: reportData.audio_listens != null ? Number(reportData.audio_listens).toLocaleString() : "—", icon: Mic, color: "text-orange-600 bg-orange-50" },
        { label: "Leads Generated", value: String(reportData.leads_generated ?? "—"), icon: Globe, color: "text-green-600 bg-green-50" },
        { label: "Conversion Rate", value: reportData.conversion_rate != null ? `${reportData.conversion_rate}%` : "—", icon: TrendingUp, color: "text-teal-600 bg-teal-50" },
      ]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Monthly Report</h1>
          <p className="text-sm text-neutral-500 mt-1">Your content performance summary.</p>
        </div>
        {report && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500 font-medium">{monthLabel}</span>
            <button className="flex items-center gap-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}
      </div>

      {!report ? (
        /* No report state */
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <BarChart2 className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-medium text-neutral-700">No report available yet</p>
          <p className="text-sm text-neutral-400 mt-1">Your first monthly report will be generated at the end of your first active month.</p>
        </div>
      ) : (
        <>
          {/* Report summary card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-neutral-900">{monthLabel} Summary</h2>
            </div>
            {summaryStats ? (
              <div className="grid grid-cols-3 gap-4">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-neutral-900">{s.value}</p>
                      <p className="text-xs text-neutral-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Report data is being compiled.</p>
            )}
          </div>

          {/* Charts section */}
          <div>
            <h2 className="font-semibold text-neutral-900 mb-4">Analytics</h2>
            <div className="grid grid-cols-2 gap-4">
              {chartSections.map((chart) => (
                <div key={chart.label} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                  <p className="text-sm font-medium text-neutral-700 mb-3">{chart.label}</p>
                  <div className="h-44 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">Chart coming soon</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download CTA */}
          <div className="bg-primary-50 border border-primary-200 rounded-2xl px-6 py-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-primary-900">Download your full report</p>
              <p className="text-sm text-primary-700 mt-0.5">Get a branded PDF ready to share with your team.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
