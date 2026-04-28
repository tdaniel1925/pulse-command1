"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { Mic, StopCircle, RotateCcw, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const TIPS = [
  "Find a quiet room — ElevenLabs is very sensitive to background noise",
  "Speak at your natural pace — don't rush or slow down artificially",
  "Vary your tone slightly — monotone recordings produce flat clones",
  "Hold your mouth 20–30cm from the mic (phone or laptop mic is fine)",
  "Aim for 3–5 minutes — more data means a better voice clone",
  "Read naturally, as if talking to a friend — not reading aloud",
];

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
      <style>{`@keyframes pulse-bar { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
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

  const [firstName, setFirstName] = useState("there");
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.first_name) setFirstName(d.first_name);
    }).catch(() => {});
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const script = `Hi, my name is ${firstName}, and I want to share something that I think about a lot in my work.

The best businesses I've ever seen — the ones that truly stand the test of time — they all have one thing in common. They make people feel heard. They make people feel valued. Not just as customers, but as human beings.

That's the kind of business I've set out to build.

Every single person who reaches out to us gets a real response. Not a template. Not an automated reply. A real, thoughtful answer from someone who genuinely cares about helping them.

Now, I know that's easy to say. Every business says they care. So let me tell you what it looks like in practice.

It means we ask questions before we give answers. It means we're honest when something isn't the right fit — even if that means losing the sale. It means we follow up, we follow through, and when things don't go as planned, we make it right.

I started this business because I believed there was a better way to serve people. And every day, I work to prove that belief right.

If you've been looking for a team you can actually trust — not just hire — I'd love to have that conversation. Reach out any time. My door is always open.

Thank you for listening. I'm ${firstName}, and I look forward to connecting with you soon.`;

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
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
    await new Promise((r) => setTimeout(r, 1500));
    router.push("/onboarding/interview");
  }

  useEffect(() => {
    if (previewUrl && audioRef.current) audioRef.current.src = previewUrl;
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <OnboardingNav current="record-audio" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <Mic className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Record Your Voice Sample</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            Read the script below naturally. ElevenLabs uses this to clone your voice for podcast episodes.
            Aim for <strong>3–5 minutes</strong> for the best clone quality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Script + Tips */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Your Script</p>
                <span className="text-xs text-neutral-400">~3–4 min</span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{script}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">Tips for Best Clone Quality</p>
              <ul className="space-y-2">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-amber-800">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Recorder */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center gap-4">
              <AudioVisualizer active={recording} />

              {recording && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-semibold text-neutral-700">Recording</span>
                  <span className="font-mono text-sm text-red-500">{formatTime(elapsed)}</span>
                </div>
              )}

              {!recording && !recordedBlob && (
                <p className="text-sm text-neutral-400">Press "Start Recording" then read the script aloud.</p>
              )}

              {recordedBlob && !recording && (
                <div className="w-full space-y-3">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-center">Playback</p>
                  <audio ref={audioRef} controls className="w-full" />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            {recordedBlob && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${elapsed >= 150 ? 'bg-green-50 border border-green-200 text-green-800' : elapsed >= 90 ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                {elapsed >= 150
                  ? <><CheckCircle className="w-4 h-4" /> Excellent! ({formatTime(elapsed)}) — ElevenLabs will produce a great voice clone.</>
                  : elapsed >= 90
                  ? <><CheckCircle className="w-4 h-4" /> Good length ({formatTime(elapsed)}) — continue reading for an even better clone.</>
                  : <><AlertCircle className="w-4 h-4" /> Only {formatTime(elapsed)} recorded — aim for at least 3 minutes for best results.</>
                }
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              {!recording && !recordedBlob && (
                <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                  <Mic className="w-4 h-4" /> Start Recording
                </button>
              )}
              {recording && (
                <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white font-semibold rounded-xl hover:bg-neutral-900 transition-colors">
                  <StopCircle className="w-4 h-4" /> Stop Recording
                  <span className="font-mono text-sm text-neutral-300">{formatTime(elapsed)}</span>
                </button>
              )}
              {recordedBlob && !recording && (
                <>
                  <button onClick={reRecord} className="flex items-center gap-2 px-5 py-3 text-neutral-700 border border-neutral-200 font-semibold rounded-xl hover:bg-neutral-50 transition-colors">
                    <RotateCcw className="w-4 h-4" /> Re-record
                  </button>
                  <button onClick={uploadAndContinue} disabled={uploading} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Upload &amp; Continue</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
