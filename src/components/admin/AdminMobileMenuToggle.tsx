"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import AdminNav from "./AdminNav";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default function AdminMobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-neutral-900" />
        ) : (
          <Menu className="w-5 h-5 text-neutral-900" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar drawer */}
          <div className="fixed left-0 top-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-50 lg:hidden shadow-lg">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-neutral-800">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
              >
                <Image src="/logo.png" alt="BundledContent" width={130} height={44} className="h-8 w-auto" />
              </Link>
            </div>

            {/* Nav */}
            <div onClick={() => setIsOpen(false)}>
              <AdminNav />
            </div>

            {/* Bottom user area */}
            <div className="px-3 py-4 border-t border-neutral-800 mt-auto">
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
          </div>
        </>
      )}
    </>
  );
}
