import { FileText, Download, Send, CheckCircle, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type ReportStatus = "ready" | "generating" | "sent";

const statusConfig: Record<ReportStatus, { label: string; className: string; icon: React.ReactNode }> = {
  generating: {
    label: "Generating",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  ready: {
    label: "Ready",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  sent: {
    label: "Sent",
    className: "bg-green-50 text-green-700 border border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, client_id, month, year, status, pdf_url, sent_at, created_at")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  const reportRows = reports ?? [];

  const totalSent = reportRows.filter((r) => r.status === "sent").length;
  const pendingGeneration = reportRows.filter((r) => r.status === "generating").length;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const thisMonth = reportRows.filter((r) => r.month === currentMonth && r.year === currentYear).length;

  const stats = [
    { label: "Total Sent", value: String(totalSent) },
    { label: "Pending Generation", value: String(pendingGeneration) },
    { label: "This Month", value: String(thisMonth) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage and send monthly performance reports to clients.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3">
        <select className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600">
          <option>All Months</option>
          <option>April 2026</option>
          <option>March 2026</option>
          <option>February 2026</option>
        </select>
        <select className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600">
          <option>2026</option>
          <option>2025</option>
        </select>
        <select className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600">
          <option>All Statuses</option>
          <option>Generating</option>
          <option>Ready</option>
          <option>Sent</option>
        </select>
      </div>

      {/* Reports grid */}
      {reportRows.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm">No reports yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {reportRows.map((report) => {
            const reportStatus = (report.status ?? "generating") as ReportStatus;
            const cfg = statusConfig[reportStatus] ?? statusConfig.generating;
            const monthName = typeof report.month === "number" ? MONTH_NAMES[report.month - 1] ?? String(report.month) : String(report.month);
            return (
              <div key={report.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-4">
                {/* Month/year + icon */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.className}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>

                <div>
                  <p className="font-semibold text-neutral-900 text-base">
                    {monthName} {report.year}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {report.sent_at
                      ? `Sent ${new Date(report.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : "Not sent yet"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  {(reportStatus === "ready" || reportStatus === "sent") && (
                    <a
                      href={report.pdf_url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-neutral-200 text-neutral-700 rounded-lg px-3 py-2 hover:bg-neutral-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </a>
                  )}
                  {reportStatus === "generating" && (
                    <button disabled className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-neutral-200 text-neutral-400 rounded-lg px-3 py-2 cursor-not-allowed">
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  )}
                  <button
                    disabled={reportStatus === "generating"}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 transition-colors ${
                      reportStatus === "generating"
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send to All
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
