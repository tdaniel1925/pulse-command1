"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";

type Avatar = {
  id: string;
  name: string;
  preview: string;
  gender: string;
};

const INITIAL_BATCHES = 4; // pages 0-3

export default function ChooseAvatarPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("there");
  const [loadProgress, setLoadProgress] = useState(0); // 0-100

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    try {
      const res = await fetch(`/api/heygen/avatars?page=${pageNum}`)
      const data = await res.json()
      if (data.avatars) {
        setAvatars(prev => append ? [...prev, ...data.avatars] : data.avatars)
        setHasMore(data.hasMore)
        setTotal(data.total)
      }
    } catch {
      // ignore
    }
  }, [])

  // Stream first 4 batches sequentially, advancing progress bar each time
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.first_name) setFirstName(d.first_name);
        if (d.heygen_avatar_id) setSelected(d.heygen_avatar_id);
      })
      .catch(() => {});

    async function streamInitial() {
      for (let p = 0; p < INITIAL_BATCHES; p++) {
        if (p > 0) await new Promise(r => setTimeout(r, 120))
        await fetchPage(p, p > 0)
        setLoadProgress(Math.round(((p + 1) / INITIAL_BATCHES) * 100))
        if (p === 0) setLoading(false)
      }
      setPage(INITIAL_BATCHES - 1)
    }

    streamInitial()
  }, [fetchPage]);

  async function loadMore() {
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    await fetchPage(next, true)
    setLoadingMore(false)
  }

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch("/api/onboarding/save-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heygen_avatar_id: selected }),
      });
      router.push("/onboarding/choose-voice");
    } catch {
      setSaving(false);
    }
  }

  const selectedAvatar = avatars.find((a) => a.id === selected);

  return (
    <div className="min-h-screen bg-neutral-50">
      <OnboardingNav current="choose-avatar" />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <span className="text-xl">🎭</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Choose Your AI Avatar</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            Hi {firstName}! Pick the presenter who will represent your brand in monthly AI videos.
            {total > 0 && <span className="text-neutral-400"> ({total} available)</span>}
          </p>
        </div>

        {loading ? (
          <div className="py-24 max-w-sm mx-auto text-center space-y-4">
            <p className="text-sm font-medium text-neutral-600">Loading avatars…</p>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadProgress === 0 ? 8 : loadProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400">{loadProgress === 0 ? "Connecting…" : `${loadProgress}%`}</p>
          </div>
        ) : avatars.length === 0 ? (
          <div className="text-center py-24 text-neutral-400">No avatars available.</div>
        ) : (
          <>
            {/* Subtle progress strip while remaining batches stream in */}
            {loadProgress < 100 && (
              <div className="mb-4 space-y-1">
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-400 text-right">{avatars.length} loaded…</p>
              </div>
            )}

            {/* Compact grid — small thumbnails, lots per row */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-6">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelected(avatar.id)}
                  style={{ animation: "fadeIn 0.3s ease both" }}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                    selected === avatar.id
                      ? "border-primary-600 ring-2 ring-primary-200 shadow-md"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                  title={avatar.name}
                >
                  {/* Selected check */}
                  {selected === avatar.id && (
                    <div className="absolute top-1 right-1 z-10 bg-primary-600 rounded-full p-px">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Avatar thumbnail */}
                  <div className="aspect-[3/4] bg-neutral-100">
                    <img
                      src={avatar.preview}
                      alt={avatar.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='80' viewBox='0 0 60 80'%3E%3Crect width='60' height='80' fill='%23e5e7eb'/%3E%3Ctext x='30' y='45' text-anchor='middle' font-size='24' fill='%239ca3af'%3E👤%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>

                  {/* Name on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[9px] font-medium leading-tight truncate">{avatar.name}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mb-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                  ) : (
                    `Load more avatars (${avatars.length} of ${total})`
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer bar */}
        <div className="flex items-center justify-between sticky bottom-4 bg-white border border-neutral-200 rounded-2xl shadow-lg px-6 py-4 mt-4">
          <p className="text-sm text-neutral-500">
            {selectedAvatar
              ? <><span className="font-semibold text-neutral-900">{selectedAvatar.name}</span> selected</>
              : "Click an avatar to select"}
          </p>
          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="flex items-center gap-2 px-7 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-4">
          Custom avatar cloning with your own likeness available as an add-on.
        </p>
      </main>
    </div>
  );
}
