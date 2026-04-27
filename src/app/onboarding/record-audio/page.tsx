"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { Mic, StopCircle, RotateCcw, Upload, Loader2 } from "lucide-react";

const SCRIPT = `Welcome to [Business Name]. I'm [Name], and today I want to talk about something that matters deeply to our clients: peace of mind.

When you invite a professional into your home or trust them with your business, you need to know they're going to show up, do the work properly, and treat you with respect.

That's exactly what we've built our reputation on. Over the years, we've worked with hundreds of clients across this community — and every single time, our goal is the same: to leave things better than we found them.

We're not just here to solve a problem. We're here to build a relationship. Because when something else comes up — and it always does — we want to be the first people you call.

So if you're ready to work with a team that genuinely cares, reach out today. We'd love to hear from you.`;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function AudioVisualizer({ active }: { active: boolean }) {
  const bars = [4, 7, 5, 9, 6, 10, 4, 8, 5, 7, 9, 4, 6, 8, 5];
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all ${active ? "bg-primary-600" : "bg-neutral-200"}`}
          style={{
            height: active ? `${h * 4}px` : "8px",
            animation: active ? `pulse-bar ${0.6 + (i % 4) * 0.15}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default function RecordAudioPage() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied. Please allow access in your browser settings and try again.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const reRecord = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setElapsed(0);
    startRecording();
  }, [previewUrl]);

  async function uploadAndContinue() {
    setUploading(true);
    await new Promise((r) => setTimeout(r, 2000));
    router.push("/onboarding/complete");
  }

  useEffect(() => {
    if (previewUrl && audioRef.current) {
      audioRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <OnboardingNav current="interview" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <Mic className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Record Your Voice Sample</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            Read the script below naturally for about 3 minutes. This creates your AI voice clone.
          </p>
        </div>

        {/* Script card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-6">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Your Script</p>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{SCRIPT}</p>
        </div>

        {/* Visualizer + timer */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 mb-6 flex flex-col items-center gap-4">
          <AudioVisualizer active={recording} />

          {recording && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-neutral-700">Recording</span>
              <span className="font-mono text-sm text-red-500">{formatTime(elapsed)}</span>
            </div>
          )}

          {!recording && !recordedBlob && (
            <p className="text-sm text-neutral-400">Press "Start Recording" to begin.</p>
          )}

          {recordedBlob && !recording && (
            <div className="w-full">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 text-center">Playback</p>
              <audio ref={audioRef} controls className="w-full" />
              <p className="text-xs text-neutral-400 text-center mt-2">
                Recorded: {formatTime(elapsed)}
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!recording && !recordedBlob && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </button>
          )}

          {recording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white font-semibold rounded-xl hover:bg-neutral-900 transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              Stop Recording
              <span className="font-mono text-sm text-neutral-300">{formatTime(elapsed)}</span>
            </button>
          )}

          {recordedBlob && !recording && (
            <>
              <button
                onClick={reRecord}
                className="flex items-center gap-2 px-5 py-3 text-neutral-700 border border-neutral-200 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Re-record
              </button>
              <button
                onClick={uploadAndContinue}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload &amp; Continue
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
