"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  GitBranch,
  BarChart2,
  CreditCard,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "CRM",
    items: [
      { label: "Clients", href: "/admin/clients", icon: Users },
      { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Pipeline", href: "/admin/pipeline", icon: GitBranch },
      { label: "Reports", href: "/admin/reports", icon: BarChart2 },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Billing", href: "/admin/billing", icon: CreditCard },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-600 text-white"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
