"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";

// HeyGen stock avatar IDs — swap these for real ones from your HeyGen account
const AVATARS = [
  {
    id: "josh_v3_public",
    name: "Josh",
    description: "Professional, confident, business-casual",
    gender: "Male",
    style: "Corporate",
    previewImage: "https://files.heygen.ai/avatar/v3/josh_v3_public/full/2.webp",
    previewVideo: "https://files.heygen.ai/avatar/v3/josh_v3_public/preview_video/short.mp4",
  },
  {
    id: "anna_v3_public",
    name: "Anna",
    description: "Warm, approachable, modern professional",
    gender: "Female",
    style: "Modern",
    previewImage: "https://files.heygen.ai/avatar/v3/anna_v3_public/full/2.webp",
    previewVideo: "https://files.heygen.ai/avatar/v3/anna_v3_public/preview_video/short.mp4",
  },
  {
    id: "wayne_v3_public",
    name: "Wayne",
    description: "Friendly, energetic, casual professional",
    gender: "Male",
    style: "Casual",
    previewImage: "https://files.heygen.ai/avatar/v3/wayne_v3_public/full/2.webp",
    previewVideo: "https://files.heygen.ai/avatar/v3/wayne_v3_public/preview_video/short.mp4",
  },
  {
    id: "lily_v3_public",
    name: "Lily",
    description: "Polished, executive presence, formal",
    gender: "Female",
    style: "Executive",
    previewImage: "https://files.heygen.ai/avatar/v3/lily_v3_public/full/2.webp",
    previewVideo: "https://files.heygen.ai/avatar/v3/lily_v3_public/preview_video/short.mp4",
  },
];

export default function ChooseAvatarPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("there");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.first_name) setFirstName(d.first_name);
        if (d.heygen_avatar_id) setSelected(d.heygen_avatar_id);
      })
      .catch(() => {});
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {AVATARS.map((avatar) => (
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

              {/* Avatar image */}
              <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
                <img
                  src={avatar.previewImage}
                  alt={avatar.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    // Fallback to a placeholder gradient if image fails
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {/* Placeholder shown when image fails */}
                <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-neutral-900">{avatar.name}</h3>
                  <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                    {avatar.gender}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-2">{avatar.description}</p>
                <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                  {avatar.style}
                </span>
              </div>

              {/* Preview video on hover */}
              {previewId === avatar.id && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <video
                    src={avatar.previewVideo}
                    autoPlay
                    loop
                    muted={false}
                    className="w-full h-full object-cover"
                    onEnded={() => setPreviewId(null)}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewId(null); }}
                    className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1 text-xs"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            {selected
              ? `Selected: ${AVATARS.find((a) => a.id === selected)?.name}`
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
