"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";

type Avatar = {
  id: string;
  name: string;
  preview: string;
};

export default function ChooseAvatarPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("there");

  useEffect(() => {
    // Load user info and existing selection
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.first_name) setFirstName(d.first_name);
        if (d.heygen_avatar_id) setSelected(d.heygen_avatar_id);
      })
      .catch(() => {});

    // Load real avatars from HeyGen
    fetch("/api/heygen/avatars")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAvatars(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <span className="text-xl">🎭</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Choose Your AI Avatar</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            Hi {firstName}! Pick the presenter who will represent your brand in monthly AI videos.
            You can change this later.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-neutral-500">Loading avatars…</span>
          </div>
        ) : avatars.length === 0 ? (
          <div className="text-center py-24 text-neutral-400">
            No avatars available. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                onClick={() => setSelected(avatar.id)}
                className={`relative bg-white rounded-2xl border-2 cursor-pointer transition-all overflow-hidden shadow-sm hover:shadow-md ${
                  selected === avatar.id
                    ? "border-primary-600 ring-2 ring-primary-100"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {selected === avatar.id && (
                  <div className="absolute top-3 right-3 z-10 bg-primary-600 rounded-full p-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Real avatar image */}
                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <img
                    src={avatar.preview}
                    alt={avatar.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='32' fill='%239ca3af'%3E👤%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-neutral-900 text-sm truncate">{avatar.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            {selected
              ? `Selected: ${selectedAvatar?.name ?? selected}`
              : "Select an avatar to continue"}
          </p>
          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          All avatars are professional AI presenters. Custom avatar cloning available as an add-on.
        </p>
      </main>
    </div>
  );
}
