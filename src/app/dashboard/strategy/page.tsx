import { redirect } from "next/navigation";

// Removed feature (strategy approval flow) — redirect to the dashboard.
export default function StrategyPage() {
  redirect("/dashboard");
}
