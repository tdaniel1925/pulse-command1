import Link from "next/link";
import Image from "next/image";
import AdminNav from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import AdminMobileMenuToggle from "@/components/admin/AdminMobileMenuToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-neutral-900 flex-col h-full">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-neutral-800">
          <Link href="/admin">
            <Image src="/logo.png" alt="BundledContent" width={130} height={44} className="h-8 w-auto" />
          </Link>
        </div>

        {/* Nav */}
        <AdminNav />

        {/* Bottom user area */}
        <div className="px-3 py-4 border-t border-neutral-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-100 truncate">Admin</p>
              <p className="text-xs text-neutral-500 truncate">administrator</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <AdminMobileMenuToggle />
            <h1 className="text-sm sm:text-base font-semibold text-neutral-900">Admin</h1>
          </div>
          <h1 className="hidden lg:block text-base font-semibold text-neutral-900">BundledContent Admin</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
