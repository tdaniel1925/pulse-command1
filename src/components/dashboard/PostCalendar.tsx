"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PostModal, type PostModalData } from "./PostModal";

type Post = PostModalData & { scheduled_at: string | null; published_at: string | null };

interface PostCalendarProps {
  posts: Post[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusDot: Record<string, string> = {
  published:        "bg-green-500",
  scheduled:        "bg-blue-500",
  pending_approval: "bg-amber-500",
  draft:            "bg-neutral-400",
  failed:           "bg-red-500",
  rejected:         "bg-neutral-300",
};

function getPostDate(post: Post): Date | null {
  const raw = post.published_at ?? post.scheduled_at;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function PostCalendar({ posts }: PostCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [activePost, setActivePost] = useState<PostModalData | null>(null);

  // Build a map: "YYYY-MM-DD" → Post[]
  const postsByDay = new Map<string, Post[]>();
  for (const post of posts) {
    const d = getPostDate(post);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!postsByDay.has(key)) postsByDay.set(key, []);
    postsByDay.get(key)!.push(post);
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      <PostModal post={activePost} onClose={() => setActivePost(null)} />

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
              className="px-2.5 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-24 bg-neutral-50/50" />;
            }

            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayPosts = postsByDay.get(key) ?? [];
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div key={key} className="h-24 p-1.5 flex flex-col gap-1 hover:bg-neutral-50 transition-colors">
                {/* Day number */}
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${
                    isToday
                      ? "bg-primary-600 text-white"
                      : "text-neutral-500"
                  }`}
                >
                  {day}
                </span>

                {/* Post chips */}
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayPosts.slice(0, 2).map((post) => {
                    const platforms = Array.isArray(post.platforms) ? post.platforms : [];
                    const dot = statusDot[post.status] ?? "bg-neutral-400";
                    return (
                      <button
                        key={post.id}
                        onClick={() => setActivePost(post)}
                        className="flex items-center gap-1 text-left w-full hover:opacity-80 transition-opacity"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                        <span className="text-[10px] text-neutral-600 truncate leading-tight">
                          {platforms.slice(0, 2).join(", ")}
                        </span>
                      </button>
                    );
                  })}
                  {dayPosts.length > 2 && (
                    <span className="text-[10px] text-neutral-400 pl-2.5">+{dayPosts.length - 2} more</span>
                  )}
                </div>

                {/* Thumbnail if has image */}
                {dayPosts.length === 1 && dayPosts[0].image_url && (
                  <button
                    onClick={() => setActivePost(dayPosts[0])}
                    className="mt-auto w-full h-8 rounded overflow-hidden flex-shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={dayPosts[0].image_url!} alt="" className="w-full h-full object-cover" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-neutral-100 bg-neutral-50">
          {[
            { label: "Published",   dot: "bg-green-500" },
            { label: "Scheduled",   dot: "bg-blue-500" },
            { label: "Needs Review",dot: "bg-amber-500" },
            { label: "Failed",      dot: "bg-red-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
              <span className="text-[11px] text-neutral-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
