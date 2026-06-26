"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { PostModal, type PostModalData } from "./PostModal";

type Post = PostModalData & { scheduled_at: string | null; published_at: string | null };

interface PostCalendarProps {
  posts: Post[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusDot: Record<string, string> = {
  published: "bg-green-500",
  scheduled: "bg-blue-500",
  pending_approval: "bg-amber-500",
  draft: "bg-neutral-400",
  failed: "bg-red-500",
  rejected: "bg-neutral-300",
};

function getPostDate(post: Post): Date | null {
  const raw = post.published_at ?? post.scheduled_at;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function PostCalendar({ posts }: PostCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const nowMs = today.getTime();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activePost, setActivePost] = useState<PostModalData | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busyDay, setBusyDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Map: "YYYY-MM-DD" → Post[]
  const postsByDay = new Map<string, Post[]>();
  for (const post of posts) {
    const d = getPostDate(post);
    if (!d) continue;
    const key = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (!postsByDay.has(key)) postsByDay.set(key, []);
    postsByDay.get(key)!.push(post);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Reschedule a dragged post onto a day (publishes at 9am that day).
  async function reschedule(postId: string, day: number) {
    const when = new Date(year, month, day, 9, 0, 0);
    const key = dayKey(year, month, day);
    setBusyDay(key);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/schedule-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, scheduledFor: when.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not reschedule");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reschedule");
    } finally {
      setBusyDay(null);
    }
  }

  // Generate a draft scheduled for a clicked day.
  async function generateForDay(day: number) {
    const when = new Date(year, month, day, 9, 0, 0);
    const key = dayKey(year, month, day);
    setBusyDay(key);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: when.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusyDay(null);
    }
  }

  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <>
      <PostModal post={activePost} onClose={() => setActivePost(null)} />

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
              className="px-2.5 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="px-5 pt-3 text-xs text-neutral-400">Drag a post to a new day to reschedule · click a day to generate a post for it.</p>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-neutral-100 mt-2">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="h-24 bg-neutral-50/50" />;

            const key = dayKey(year, month, day);
            const dayPosts = postsByDay.get(key) ?? [];
            const isToday = key === todayKey;
            const isPast = new Date(year, month, day, 23, 59).getTime() < nowMs;
            const isBusy = busyDay === key;

            return (
              <div
                key={key}
                onDragOver={(e) => { if (dragId && !isPast) e.preventDefault(); }}
                onDrop={() => { if (dragId && !isPast) { reschedule(dragId, day); setDragId(null); } }}
                className={`group relative h-24 p-1.5 flex flex-col gap-1 transition-colors ${
                  dragId && !isPast ? "hover:bg-primary-50 hover:ring-1 hover:ring-primary-300 ring-inset" : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${
                    isToday ? "bg-primary-600 text-white" : "text-neutral-500"
                  }`}>{day}</span>
                  {/* Generate-for-day affordance (future days only) */}
                  {!isPast && (
                    <button
                      onClick={() => generateForDay(day)}
                      disabled={isBusy}
                      title="Generate a post for this day"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-primary-500 hover:bg-primary-100 disabled:opacity-100"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayPosts.slice(0, 2).map((post) => {
                    const platforms = Array.isArray(post.platforms) ? post.platforms : [];
                    const dot = statusDot[post.status] ?? "bg-neutral-400";
                    const draggable = post.status !== "published";
                    return (
                      <div
                        key={post.id}
                        draggable={draggable}
                        onDragStart={() => draggable && setDragId(post.id)}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => setActivePost(post)}
                        className={`flex items-center gap-1 text-left w-full hover:opacity-80 transition-opacity ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                        <span className="text-[10px] text-neutral-600 truncate leading-tight">{platforms.slice(0, 2).join(", ")}</span>
                      </div>
                    );
                  })}
                  {dayPosts.length > 2 && <span className="text-[10px] text-neutral-400 pl-2.5">+{dayPosts.length - 2} more</span>}
                </div>

                {dayPosts.length === 1 && dayPosts[0].image_url && (
                  <button onClick={() => setActivePost(dayPosts[0])} className="mt-auto w-full h-8 rounded overflow-hidden flex-shrink-0">
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
            { label: "Published", dot: "bg-green-500" },
            { label: "Scheduled", dot: "bg-blue-500" },
            { label: "Draft", dot: "bg-neutral-400" },
            { label: "Failed", dot: "bg-red-500" },
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
