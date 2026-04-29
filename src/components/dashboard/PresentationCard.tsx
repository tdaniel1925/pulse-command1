"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  presentation: Presentation;
}

function SlideIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="46" height="34" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="6" y="7" width="20" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="6" y="13" width="36" height="2" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="6" y="18" width="30" height="2" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="6" y="23" width="24" height="2" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PresentationCard({ presentation }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this presentation?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/presentations/${presentation.id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {presentation.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={presentation.thumbnail_url}
            alt={presentation.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            <SlideIcon className="w-12 h-9 text-white/80" />
            <p className="text-white text-sm font-medium text-center line-clamp-2 leading-tight">
              {presentation.title}
            </p>
          </div>
        )}

        {/* Generating overlay */}
        {presentation.status === "generating" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-white text-sm font-medium">Generating...</span>
            </div>
          </div>
        )}

        {/* Failed overlay */}
        {presentation.status === "failed" && (
          <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Failed
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <p className="font-semibold text-neutral-900 line-clamp-1">{presentation.title}</p>
        {presentation.topic && (
          <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">{presentation.topic}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-400">
          {presentation.slide_count != null && (
            <span>{presentation.slide_count} slides</span>
          )}
          {presentation.slide_count != null && presentation.created_at && (
            <span>·</span>
          )}
          {presentation.created_at && (
            <span>{formatDate(presentation.created_at)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Link
            href={`/dashboard/presentations/${presentation.id}`}
            className="flex-1 text-center text-sm font-medium bg-indigo-600 text-white rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors"
          >
            Open
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            aria-label="Delete presentation"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
