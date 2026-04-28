"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { CheckCircle, ChevronRight, Loader2, Play, Square } from "lucide-react";

// ElevenLabs stock voice IDs — these are real public voices from ElevenLabs
const VOICES = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    description: "Calm, professional, American female",
    gender: "Female",
    accent: "American",
    style: "Conversational",
    useCase: "Podcasts, explainers",
    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8312-aab3b3d8f50a.mp3",
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    name: "Domi",
    description: "Strong, confident, American female",
    gender: "Female",
    accent: "American",
    style: "Authoritative",
    useCase: "Brand videos, announcements",
    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/69c5a56e-8b41-4b4e-8c62-8c5de5d4b6d7.mp3",
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    description: "Well-rounded, warm, American male",
    gender: "Male",
    accent: "American",
    style: "Friendly",
    useCase: "Podcasts, storytelling",
    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f8f0-1122-4333-b323-0b87478d506a.mp3",
  },
  {
    id: "VR6AewLTigWG4xSOukaG",
    name: "Arnold",
    description: "Crisp, authoritative, American male",
    gender: "Male",
    accent: "American",
    style: "Authoritative",
    useCase: "Corporate, brand authority",
    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/66f4fc7a-3dc0-4b27-8b97-5e3a0ab2d56f.mp3",
  },
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    description: "Deep, neutral, American male",
    gender: "Male",
    accent: "American",
    style: "Narrative",
    useCase: "Long-form content, podcasts",
    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/aac04b99-7f5f-4a24-b1c7-1aaac4481df6.mp3",
  },
  {
    id: "MF3mGyEYCl7XYWbV9V6O",
    name: "Elli",
    description: "Emotional, young, American female",
    gender: "Female",
    accent: "American",
    style: "Expressive",
    useCase: "Engaging content, social clips",
    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/ded6ef46-f7af-4d80-9fc4-72bc9a3e5f8d.mp3",
  },
];

export default function ChooseVoicePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("there");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.first_name) setFirstName(d.first_name);
        if (d.elevenlabs_voice_id) setSelected(d.elevenlabs_voice_id);
      })
      .catch(() => {});

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function togglePlay(voice: typeof VOICES[0]) {
    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(voice.previewUrl);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
    audioRef.current = audio;
    setPlayingId(voice.id);
  }

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch("/api/onboarding/save-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elevenlabs_voice_id: selected }),
      });
      router.push("/onboarding/interview");
    } catch {
      setSaving(false);
    }
  }

  const selectedVoice = VOICES.find((v) => v.id === selected);

  return (
    <div className="min-h-screen bg-neutral-50">
      <OnboardingNav current="choose-voice" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <span className="text-xl">🎙️</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Choose Your AI Voice</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            This voice will narrate your bi-weekly podcast episodes. Hit play to preview each one.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {VOICES.map((voice) => (
            <div
              key={voice.id}
              onClick={() => setSelected(voice.id)}
              className={`bg-white rounded-2xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md p-4 ${
                selected === voice.id
                  ? "border-primary-600 ring-2 ring-primary-100"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Play button */}
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(voice); }}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    playingId === voice.id
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                >
                  {playingId === voice.id ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Voice info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-neutral-900">{voice.name}</h3>
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                      {voice.gender}
                    </span>
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                      {voice.accent}
                    </span>
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                      {voice.style}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">{voice.description}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Best for: {voice.useCase}</p>
                </div>

                {/* Selected indicator */}
                <div className="flex-shrink-0">
                  {selected === voice.id ? (
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-200" />
                  )}
                </div>
              </div>

              {/* Waveform animation when playing */}
              {playingId === voice.id && (
                <div className="mt-3 flex items-center gap-0.5 h-6 px-16">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary-400 rounded-full"
                      style={{
                        height: `${20 + Math.sin(i * 0.8) * 12}px`,
                        animation: `pulse-bar ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.03}s`,
                      }}
                    />
                  ))}
                  <style>{`@keyframes pulse-bar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            {selectedVoice
              ? `Selected: ${selectedVoice.name} — ${selectedVoice.style}`
              : "Select a voice to continue"}
          </p>
          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <>Continue to Interview <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Custom voice cloning with your own recordings available as an add-on upgrade.
        </p>
      </main>
    </div>
  );
}
