import Link from "next/link";
import { Zap, LogOut } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

        {/* Nav — client component for active state */}
        <DashboardNav />

        {/* Bottom client area */}
        <div className="px-3 py-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">Apex Roofing</p>
              <p className="text-xs text-neutral-400 truncate">Your Plan: $745/mo</p>
            </div>
            <button
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center flex-shrink-0">
          <h1 className="text-base font-semibold text-neutral-900">Client Dashboard</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
