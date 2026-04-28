"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Share2,
  Video,
  Mic,
  BarChart2,
  GitBranch,
  Settings,
  CreditCard,
  Upload,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Social Posts", href: "/dashboard/social", icon: Share2 },
  { label: "Videos", href: "/dashboard/videos", icon: Video },
  { label: "Audio", href: "/dashboard/audio", icon: Mic },
  { label: "Reports", href: "/dashboard/report", icon: BarChart2 },
  { label: "Workflow", href: "/dashboard/workflow", icon: GitBranch },
  { label: "Upload Content", href: "/dashboard/upload", icon: Upload },
  { label: "Add-ons", href: "/dashboard/addons", icon: Sparkles },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {navItems.map(({ label, href, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary-600" : "text-neutral-400"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
