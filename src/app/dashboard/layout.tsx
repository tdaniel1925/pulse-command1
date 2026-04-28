import Link from "next/link";
import { Zap } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = user
    ? await supabase
        .from("clients")
        .select("first_name, last_name, business_name")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const displayName = client?.business_name ?? (`${client?.first_name ?? ""} ${client?.last_name ?? ""}`.trim() || "My Account");
  const initials = (client?.first_name?.[0] ?? client?.business_name?.[0] ?? "?").toUpperCase();

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col h-full">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-neutral-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-neutral-900">PulseCommand</span>
          </Link>
        </div>

        {/* Nav */}
        <DashboardNav />

        {/* Bottom client area */}
        <div className="px-3 py-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{displayName}</p>
              <p className="text-xs text-neutral-400 truncate">$745/mo plan</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-base font-semibold text-neutral-900">Client Dashboard</h1>
          <Link
            href="/onboarding/welcome"
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Setup guide →
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
