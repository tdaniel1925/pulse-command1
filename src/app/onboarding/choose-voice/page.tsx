"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { CheckCircle, ChevronRight, Loader2, Play, Square } from "lucide-react";

// ElevenLabs premade public voice IDs — stable, never change
const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel",  gender: "Female", accent: "American", style: "Conversational",  description: "Calm, clear, and professional",          useCase: "Podcasts, explainers",          previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8312-aab3b3d8f50a.mp3" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew",    gender: "Male",   accent: "American", style: "Well-rounded",    description: "Confident, balanced, authoritative",     useCase: "Brand videos, narration",       previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/29vD33N1CtxCmqQRPOHJ/e8b7f5e0-6dfd-4b77-a9e5-3e53ef44e4e0.mp3" },
  { id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde",   gender: "Male",   accent: "American", style: "Grounded",        description: "Deep, steady, trustworthy",              useCase: "Corporate, thought leadership", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/2EiwWnXFnvU5JabPnv8n/65d80f52-703f-4cae-a91d-75d4e200ed02.mp3" },
  { id: "5Q0t7uMcjvnagumLfvZi", name: "Paul",    gender: "Male",   accent: "American", style: "Grounded",        description: "Warm, mature, believable",               useCase: "Storytelling, podcasts",        previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/5Q0t7uMcjvnagumLfvZi/1e5a7344-5b00-49d9-befd-c3f4ade9b4e6.mp3" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi",    gender: "Female", accent: "American", style: "Authoritative",   description: "Strong, bold, commanding",               useCase: "Announcements, brand authority",previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/69c5a56e-8b41-4b4e-8c62-8c5de5d4b6d7.mp3" },
  { id: "CYw3kZ02Hs0563khs1Fj", name: "Dave",    gender: "Male",   accent: "British",  style: "Conversational",  description: "Friendly, natural, everyday tone",       useCase: "Social content, vlogs",         previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/CYw3kZ02Hs0563khs1Fj/872cb056-e629-4b51-ae54-4a12a8b7b3f5.mp3" },
  { id: "D38z5RcWu1voky8WS1ja", name: "Fin",     gender: "Male",   accent: "Irish",    style: "Character",       description: "Distinctive, warm, memorable",           useCase: "Brand personality, social",     previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/D38z5RcWu1voky8WS1ja/a470ba64-1e72-4585-9bec-4e5601e1c5ef.mp3" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah",   gender: "Female", accent: "American", style: "Soft",            description: "Gentle, empathetic, reassuring",         useCase: "Wellness, lifestyle brands",    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3622a-a772-4c37-a3ee-b2b9b2bcfbe0.mp3" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni",  gender: "Male",   accent: "American", style: "Friendly",        description: "Well-rounded, warm, approachable",       useCase: "Podcasts, storytelling",        previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f8f0-1122-4333-b323-0b87478d506a.mp3" },
  { id: "GBv7mTt0atIp3Br8iCZE", name: "Thomas",  gender: "Male",   accent: "American", style: "Calm",            description: "Measured, thoughtful, composed",         useCase: "Education, explainers",         previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/GBv7mTt0atIp3Br8iCZE/98542988-4a58-4bc0-b124-f8e6452e8b62.mp3" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", gender: "Male",   accent: "Australian",style: "Natural",         description: "Relaxed, genuine, easy to listen to",    useCase: "Lifestyle, casual content",     previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/c3a2c2a9-34ee-4b8e-9fcb-b3e7ccbc614b.mp3" },
  { id: "LcfcDJNUP1GQjkzn1xUU", name: "Emily",   gender: "Female", accent: "American", style: "Calm",            description: "Smooth, professional, easy-going",       useCase: "Corporate, brand narration",    previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/LcfcDJNUP1GQjkzn1xUU/e4b994b7-9713-4238-84f3-add8fccaaccd.mp3" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli",    gender: "Female", accent: "American", style: "Expressive",      description: "Energetic, emotional, engaging",         useCase: "Social clips, promos",          previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/ded6ef46-f7af-4d80-9fc4-72bc9a3e5f8d.mp3" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum",  gender: "Male",   accent: "American", style: "Intense",         description: "Bold, punchy, high-energy",              useCase: "Ads, promos, bold brands",      previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/ac833bd8-ffda-4938-9ebc-b0f99ca25481.mp3" },
  { id: "ODq5zmih8GrVes37Dizd", name: "Patrick", gender: "Male",   accent: "American", style: "Confident",       description: "Clear, assertive, self-assured",         useCase: "Sales, pitches, authority",     previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ODq5zmih8GrVes37Dizd/0ebec87a-2569-4976-b06b-5c1ea5f6a789.mp3" },
  { id: "SOYHLrjzK2X1ezoPC6cr", name: "Harry",   gender: "Male",   accent: "American", style: "Animated",        description: "Lively, dynamic, keeps attention",       useCase: "Entertainment, social media",   previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/SOYHLrjzK2X1ezoPC6cr/86d178f6-f4b6-4e0e-a662-51e6f0b49e80.mp3" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam",    gender: "Male",   accent: "American", style: "Articulate",      description: "Sharp, precise, intelligent delivery",   useCase: "Finance, tech, professional",   previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63f7b247-e4b9-4b4e-a76a-c33dfc748bbd.mp3" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", gender: "Female", accent: "British",  style: "Pleasant",        description: "Warm, charming, professional British",   useCase: "Luxury, lifestyle, elegance",   previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ThT5KcBeYPX3keUQqHPh/981f0855-6598-48d2-9f8f-b6d92fbbe3fc.mp3" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh",    gender: "Male",   accent: "American", style: "Deep",            description: "Rich, resonant, commanding presence",    useCase: "Podcasts, authority content",   previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/685e2a03-c2e3-4a1d-988f-d43c81ae5e9f.mp3" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold",  gender: "Male",   accent: "American", style: "Authoritative",   description: "Crisp, serious, no-nonsense delivery",   useCase: "Corporate, announcements",      previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/66f4fc7a-3dc0-4b27-8b97-5e3a0ab2d56f.mp3" },
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

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <span className="text-xl">🎙️</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Choose Your AI Voice</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            This voice will narrate your bi-weekly podcast episodes. Hit play to preview each one.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {VOICES.map((voice) => (
            <div
              key={voice.id}
              onClick={() => setSelected(voice.id)}
              className={`relative bg-white rounded-2xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md p-4 flex flex-col items-center text-center gap-3 ${
                selected === voice.id
                  ? "border-primary-600 ring-2 ring-primary-100"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {/* Selected check */}
              {selected === voice.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                </div>
              )}

              {/* Play button */}
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(voice); }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
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

              {/* Waveform when playing */}
              {playingId === voice.id ? (
                <div className="flex items-center gap-0.5 h-5 w-full justify-center">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary-400 rounded-full"
                      style={{
                        height: `${10 + Math.sin(i * 0.8) * 8}px`,
                        animation: `pulse-bar ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.04}s`,
                      }}
                    />
                  ))}
                  <style>{`@keyframes pulse-bar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
                </div>
              ) : (
                <div className="h-5" />
              )}

              {/* Voice info */}
              <div className="space-y-1">
                <p className="font-bold text-neutral-900 text-sm">{voice.name}</p>
                <p className="text-xs text-neutral-500">{voice.accent} · {voice.gender}</p>
                <span className="inline-block text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                  {voice.style}
                </span>
                <p className="text-xs text-neutral-400 leading-snug">{voice.description}</p>
              </div>
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
