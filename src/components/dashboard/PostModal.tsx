"use client";

import { useEffect } from "react";
import { X, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
};

const platformStyles: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  linkedin: "bg-blue-100 text-blue-800",
  twitter: "bg-sky-100 text-sky-700",
  tiktok: "bg-neutral-100 text-neutral-700",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending_approval: { label: "Needs Approval", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  published:        { label: "Published",       className: "bg-green-50 text-green-700 border border-green-200" },
  scheduled:        { label: "Scheduled",       className: "bg-blue-50 text-blue-700 border border-blue-200" },
  draft:            { label: "Draft",           className: "bg-neutral-100 text-neutral-500 border border-neutral-200" },
  failed:           { label: "Failed",          className: "bg-red-50 text-red-600 border border-red-200" },
  rejected:         { label: "Rejected",        className: "bg-neutral-100 text-neutral-400 border border-neutral-200" },
};

export type PostModalData = {
  id: string;
  content: string;
  image_url: string | null;
  platforms: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
};

interface PostModalProps {
  post: PostModalData | null;
  onClose: () => void;
}

export function PostModal({ post, onClose }: PostModalProps) {
  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [post, onClose]);

  if (!post) return null;

  const cfg = statusConfig[post.status] ?? statusConfig.draft;
  const dateStr = post.published_at ?? post.scheduled_at;
  const dateLabel = dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 flex-wrap">
            {post.platforms.map((p) => (
              <span
                key={p}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full capitalize ${platformStyles[p.toLowerCase()] ?? "bg-neutral-100 text-neutral-600"}`}
              >
                {platformIcons[p.toLowerCase()] ?? null}
                {p}
              </span>
            ))}
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
              {cfg.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors ml-2 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="w-full bg-neutral-100 max-h-72 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="" className="w-full object-contain max-h-72" />
          </div>
        )}

        {/* Caption */}
        <div className="px-6 py-5">
          <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>

        {/* Footer */}
        {dateLabel && (
          <div className="px-6 pb-5 pt-0">
            <p className="text-xs text-neutral-400">
              {post.status === "published" ? "Published" : post.status === "scheduled" ? "Scheduled for" : ""} {dateLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
