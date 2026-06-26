import { redirect } from "next/navigation";

// Removed feature — redirect to the dashboard so it isn't reachable by URL.
export default function AddonsPage() {
  redirect("/dashboard");
}
