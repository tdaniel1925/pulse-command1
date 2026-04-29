"use client";

import { useEffect, useState } from "react";

export default function WelcomeBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("welcome=1")) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    // Clean the URL param without a page reload
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState({}, "", url.toString());
  };

  if (!show || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-indigo-600 text-white rounded-2xl px-6 py-4 mb-6">
      <p className="text-sm font-medium">
        🎉 Welcome! Your first post is being generated — check the Social tab in a few minutes.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
