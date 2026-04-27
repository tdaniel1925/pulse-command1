import { Plus, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
  high: { label: "High", className: "bg-orange-100 text-orange-700" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700" },
  low: { label: "Low", className: "bg-neutral-100 text-neutral-500" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-neutral-100 text-neutral-600" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  done: { label: "Done", className: "bg-green-100 text-green-700" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const filterTabs = ["All", "Pending", "In Progress", "Done"];

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, priority, status, due_at, assigned_to, client_id")
    .order("due_at", { ascending: true });

  const taskRows = tasks ?? [];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Tasks</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {filterTabs.map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                i === 0
                  ? "bg-primary-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
          Priority
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

      {/* Task cards */}
      {taskRows.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm">No tasks yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {taskRows.map((task) => {
            const priorityKey = task.priority ?? "low";
            const statusKey = task.status ?? "pending";
            const priority = priorityConfig[priorityKey] ?? { label: priorityKey, className: "bg-neutral-100 text-neutral-500" };
            const status = statusConfig[statusKey] ?? { label: statusKey, className: "bg-neutral-100 text-neutral-600" };
            const assignedInitials = task.assigned_to
              ? task.assigned_to.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
              : "?";
            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                {/* Priority badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5 ${priority.className}`}
                >
                  {priority.label}
                </span>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold text-neutral-900 ${
                      statusKey === "done" ? "line-through text-neutral-400" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-neutral-500 mt-0.5">{task.description}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">Due {formatDate(task.due_at)}</p>
                </div>

                {/* Status */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.className}`}
                >
                  {status.label}
                </span>

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{assignedInitials}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
