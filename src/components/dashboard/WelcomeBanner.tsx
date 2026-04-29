"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("welcome=1")) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState({}, "", url.toString());
  }

  if (!visible) return null;

  return (
    <div className="bg-indigo-600 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
      <p className="text-white text-sm font-medium">
        🎉 Welcome! Your first post is being generated — check the Social tab in a few minutes.
      </p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-indigo-200 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
