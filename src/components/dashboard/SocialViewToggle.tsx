"use client";

import { useState } from "react";
import { LayoutGrid, CalendarDays } from "lucide-react";
import { SocialPostsGrid } from "./SocialPostsGrid";
import { PostCalendar } from "./PostCalendar";
import type { PostModalData } from "./PostModal";

type Post = PostModalData & { scheduled_at: string | null; published_at: string | null };

interface SocialViewToggleProps {
  posts: Post[];
  failed: number;
}

export function SocialViewToggle({ posts, failed }: SocialViewToggleProps) {
  const [view, setView] = useState<"grid" | "calendar">("grid");

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setView("grid")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "grid"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Posts
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "calendar"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Calendar
        </button>
      </div>

      {view === "grid"
        ? <SocialPostsGrid posts={posts} failed={failed} />
        : <PostCalendar posts={posts} />}
    </div>
  );
}
