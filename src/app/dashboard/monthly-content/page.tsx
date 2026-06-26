import { redirect } from "next/navigation";

// Removed feature (multi-format monthly content + approval) — redirect to the dashboard.
export default function MonthlyContentPage() {
  redirect("/dashboard");
}
