"use client";

import { useState } from "react";
import { PostModal, PostModalData } from "@/components/dashboard/PostModal";
import { ApproveButton } from "@/components/dashboard/ApproveButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: string;
  content: string;
  image_url: string | null;
  platforms: string[];
  status: string;
  created_at: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  metadata?: Record<string, unknown>;
};

interface Props {
  posts: Post[];
}

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    id: "generating",
    label: "Generating",
    statuses: ["draft", "failed"],
    color: "bg-neutral-100 text-neutral-600",
    border: "border-neutral-200",
    dot: "bg-neutral-400",
  },
  {
    id: "pending",
    label: "Pending Approval",
    statuses: ["pending_approval"],
    color: "bg-amber-50 text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    statuses: ["scheduled"],
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  {
    id: "published",
    label: "Published",
    statuses: ["published"],
    color: "bg-green-50 text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
];

// ─── Platform badge config ────────────────────────────────────────────────────

const PLATFORM_BADGES: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  linkedin: "bg-blue-100 text-blue-900",
  twitter: "bg-neutral-100 text-neutral-800",
  tiktok: "bg-neutral-100 text-neutral-700",
};

function platformShort(plat: string): string {
  const map: Record<string, string> = {
    instagram: "IG",
    facebook: "FB",
    linkedin: "LI",
    twitter: "X",
    tiktok: "TK",
  };
  return map[plat] ?? plat.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}) {
  const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
  const dateStr = post.published_at ?? post.scheduled_at ?? post.created_at;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-neutral-200 shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-700 line-clamp-2 leading-snug">{post.content}</p>

          {/* Platform badges */}
          {platforms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {platforms.map((plat) => (
                <span
                  key={plat}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    PLATFORM_BADGES[plat] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {platformShort(plat)}
                </span>
              ))}
            </div>
          )}

          {/* Date + status badges */}
          <div className="flex items-center gap-2 mt-1.5">
            {dateStr && (
              <span className="text-xs text-neutral-400">{formatDate(dateStr)}</span>
            )}
            {post.status === "failed" && (
              <span className="text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                Failed
              </span>
            )}
            {post.status === "draft" && (
              <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded animate-pulse">
                Generating...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Approve button for pending posts */}
      {post.status === "pending_approval" && (
        <div
          className="mt-3 pt-3 border-t border-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          <ApproveButton type="post" id={post.id} />
        </div>
      )}
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function WorkflowBoard({ posts }: Props) {
  const [activePost, setActivePost] = useState<PostModalData | null>(null);

  function openPost(post: Post) {
    setActivePost({
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      platforms: Array.isArray(post.platforms) ? post.platforms : [],
      status: post.status,
      scheduled_at: post.scheduled_at,
      published_at: post.published_at,
      metadata: post.metadata,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Content Pipeline</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colPosts = posts.filter((p) => col.statuses.includes(p.status));

          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column header */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${col.color} ${col.border}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                <span className="text-xs font-semibold flex-1">{col.label}</span>
                <span className="text-xs font-bold bg-white/60 px-1.5 py-0.5 rounded-full">
                  {colPosts.length}
                </span>
              </div>

              {/* Cards */}
              <div className="max-h-[600px] overflow-y-auto space-y-3 pr-0.5">
                {colPosts.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-4">
                    No posts {col.id === "generating" ? "generating" : `in ${col.label.toLowerCase()}`}
                  </p>
                ) : (
                  colPosts.map((post) => (
                    <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <PostModal post={activePost} onClose={() => setActivePost(null)} />
    </div>
  );
}
