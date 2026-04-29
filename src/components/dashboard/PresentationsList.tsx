"use client";

import { useState } from "react";
import { PresentationCard } from "@/components/dashboard/PresentationCard";
import { NewPresentationModal } from "@/components/dashboard/NewPresentationModal";

type Presentation = {
  id: string;
  title: string;
  topic: string | null;
  status: string;
  slide_count: number | null;
  thumbnail_url: string | null;
  created_at: string | null;
};

interface Props {
  presentations: Presentation[];
  presentationsUsed: number;
  presentationsLimit: number;
  clientId: string;
}

function SlideHeroIcon() {
  return (
    <svg
      className="w-20 h-15 text-neutral-300"
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="76" height="56" rx="5" stroke="currentColor" strokeWidth="3" fill="none" />
      <rect x="12" y="12" width="32" height="5" rx="2.5" fill="currentColor" />
      <rect x="12" y="22" width="56" height="3.5" rx="1.75" fill="currentColor" opacity="0.5" />
      <rect x="12" y="30" width="48" height="3.5" rx="1.75" fill="currentColor" opacity="0.5" />
      <rect x="12" y="38" width="38" height="3.5" rx="1.75" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function PresentationsList({ presentations, presentationsUsed, presentationsLimit, clientId: _clientId }: Props) {
  const [showNewModal, setShowNewModal] = useState(false);
  const atLimit = presentationsUsed >= presentationsLimit;
  const isEmpty = presentations.length === 0;

  return (
    <>
      {isEmpty ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <SlideHeroIcon />
          <h1 className="mt-6 text-2xl font-bold text-neutral-900">Create your first presentation</h1>
          <p className="mt-2 text-neutral-500 max-w-sm">
            AI-powered slides in minutes. Professional design, your brand.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="mt-6 bg-indigo-600 text-white font-semibold text-base px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Create Presentation
          </button>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full">
            <span>🎁</span>
            <span>1 free presentation included</span>
          </div>
        </div>
      ) : (
        /* Presentations grid */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-neutral-900">My Presentations</h1>
            <button
              onClick={() => setShowNewModal(true)}
              className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
            >
              New Presentation
            </button>
          </div>

          {/* Usage badge */}
          <div className="inline-flex">
            <span
              className={`text-sm font-medium px-3 py-1.5 rounded-full border ${
                atLimit
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              {presentationsUsed} of {presentationsLimit} presentation{presentationsLimit !== 1 ? "s" : ""} used
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((p) => (
              <PresentationCard key={p.id} presentation={p} />
            ))}
          </div>
        </div>
      )}

      <NewPresentationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        presentationsUsed={presentationsUsed}
        presentationsLimit={presentationsLimit}
      />
    </>
  );
}
