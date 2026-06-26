import { redirect } from "next/navigation";

// Removed feature (landing pages) — redirect to the dashboard.
export default function PagesPage() {
  redirect("/dashboard");
}
