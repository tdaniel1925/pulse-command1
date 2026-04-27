import { Users, UserCheck, DollarSign, CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// --- Types ---
type StatusKey = "lead" | "onboarding" | "active" | "paused" | "churned";
type PriorityKey = "urgent" | "high" | "medium" | "low";

// --- Badge config ---
const statusBadge: Record<StatusKey, string> = {
  lead: "bg-neutral-100 text-neutral-600",
  onboarding: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-orange-100 text-orange-700",
  churned: "bg-red-100 text-red-700",
};

const priorityBadge: Record<PriorityKey, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-neutral-100 text-neutral-600",
};

// --- Page ---
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch stats
  const { count: totalClients } = await supabase
    .from("clients").select("*", { count: "exact", head: true });

  const { count: activeClients } = await supabase
    .from("clients").select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: tasksDue } = await supabase
    .from("tasks").select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .lte("due_at", new Date(Date.now() + 86400000).toISOString());

  // Recent clients
  const { data: recentClients } = await supabase
    .from("clients")
    .select("id, first_name, last_name, email, business_name, status, onboarding_step, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Tasks due
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, priority, status, due_at, client_id")
    .eq("status", "pending")
    .order("due_at", { ascending: true })
    .limit(5);

  const statCards = [
    {
      label: "Total Clients",
      value: String(totalClients ?? 0),
      trend: "+3 this month",
      trendUp: true,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Clients",
      value: String(activeClients ?? 0),
      trend: `${totalClients ? Math.round(((activeClients ?? 0) / totalClients) * 100) : 0}% of total`,
      trendUp: true,
      icon: UserCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Revenue MRR",
      value: "$13,410", // TODO: fetch from subscriptions table
      trend: "+$1,240 vs last month",
      trendUp: true,
      icon: DollarSign,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Tasks Due",
      value: String(tasksDue ?? 0),
      trend: "pending tasks",
      trendUp: false,
      icon: CheckSquare,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const clientRows = recentClients ?? [];
  const taskRows = tasks ?? [];

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Dashboard</h2>
        <p className="text-sm text-neutral-500 mt-1">Welcome back — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-500">{card.label}</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-neutral-900">{card.value}</p>
                <p
                  className={`text-xs mt-1 font-medium ${
                    card.trendUp ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {card.trend}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lower two-column section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Clients — 2/3 width */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-900">Recent Clients</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Business</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Step</th>
                  <th className="text-left px-6 py-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {clientRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-400">
                      No clients yet.
                    </td>
                  </tr>
                ) : (
                  clientRows.map((client) => {
                    const statusKey = (client.status ?? "lead") as StatusKey;
                    return (
                      <tr key={client.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-neutral-900 whitespace-nowrap">
                          {client.first_name ?? ""} {client.last_name ?? ""}
                        </td>
                        <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                          {client.business_name ?? "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusBadge[statusKey] ?? "bg-neutral-100 text-neutral-600"}`}
                          >
                            {statusKey}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                          {client.onboarding_step ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-neutral-400 whitespace-nowrap">
                          {client.created_at
                            ? new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks Due Today — 1/3 width */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-900">Tasks Due Today</h3>
          </div>
          {taskRows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-neutral-400 text-center">No pending tasks.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {taskRows.map((task) => {
                const priorityKey = (task.priority ?? "low") as PriorityKey;
                return (
                  <li key={task.id} className="px-6 py-4 flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${priorityBadge[priorityKey] ?? "bg-neutral-100 text-neutral-600"}`}
                    >
                      {priorityKey}
                    </span>
                    <p className="text-sm text-neutral-700 leading-snug">{task.title}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
