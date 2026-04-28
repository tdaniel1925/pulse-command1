"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { Video, StopCircle, RotateCcw, Upload, Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const TIPS = [
  "Look directly into the camera lens, not at your own image on screen",
  "Good lighting matters most — face a window or bright light source",
  "Keep your background clean and uncluttered",
  "Speak at a natural, slightly slower than normal pace",
  "Aim for 2–3 minutes — HeyGen works best with this length",
  "Don't worry about perfection — natural is better than rehearsed",
];

export default function RecordVideoPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [firstName, setFirstName] = useState("there");
  const [cameraActive, setCameraActive] = useState(false);
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

  const script = `Hi, I'm ${firstName} — and I want to take a moment to speak directly to you.

[Pause 1 second]

Every day, I work with people who have a real problem to solve. And what I've found, time and time again, is that what they really want — more than anything else — is someone they can trust.

[Pause]

Someone who shows up when they say they will. Someone who's honest about what's needed and what isn't. Someone who treats their time and their money with respect.

[Pause]

That's the standard I hold myself and my team to. It's not just about doing the job — it's about doing right by the people we serve.

[Pause]

If that sounds like the kind of business relationship you've been looking for, I'd genuinely love to connect. Reach out — I read every message personally.

[Pause]

Thank you for taking the time to watch this. I look forward to working with you.`;

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError("Camera or microphone access was denied. Please allow access in your browser settings and try again.");
    }
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm;codecs=vp9,opus" });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  }

  const reRecord = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setElapsed(0);
    startCamera();
  }, [previewUrl]);

  async function uploadAndContinue() {
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push("/onboarding/record-audio");
  }

  useEffect(() => {
    if (previewUrl && previewRef.current) previewRef.current.src = previewUrl;
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <OnboardingNav current="record-video" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <Video className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Record Your Avatar Video</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            Read the script below on camera. HeyGen will use this to build your AI presenter avatar.
            Aim for <strong>2–3 minutes</strong> — longer recordings produce better avatars.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Script + Tips */}
          <div className="lg:col-span-2 space-y-4">
            {/* Script */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Your Script</p>
                <span className="text-xs text-neutral-400">~2 min</span>
              </div>
              <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line space-y-1">
                {script.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('[') ? 'text-xs text-primary-500 italic' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">Tips for Best Quality</p>
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

          {/* Right: Camera */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video area */}
            <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
              {!recordedBlob ? (
                <>
                  <video ref={videoRef} muted playsInline className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`} />
                  {!cameraActive && (
                    <div className="flex flex-col items-center gap-3 text-neutral-400">
                      <Camera className="w-12 h-12" />
                      <p className="text-sm">Camera not active</p>
                    </div>
                  )}
                  {recording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-xs font-semibold">REC</span>
                      <span className="text-red-400 text-xs font-mono">{formatTime(elapsed)}</span>
                    </div>
                  )}
                  {elapsed >= 60 && recording && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Great — keep going!
                    </div>
                  )}
                </>
              ) : (
                <video ref={previewRef} controls playsInline className="w-full h-full object-cover" />
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Duration indicator after recording */}
            {recordedBlob && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${elapsed >= 90 ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                {elapsed >= 90
                  ? <><CheckCircle className="w-4 h-4" /> Great length! ({formatTime(elapsed)}) — HeyGen will produce a high-quality avatar.</>
                  : <><AlertCircle className="w-4 h-4" /> Recording is {formatTime(elapsed)} — we recommend at least 90 seconds for best results.</>
                }
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!cameraActive && !recordedBlob && (
                <button onClick={startCamera} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              )}
              {cameraActive && !recording && (
                <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                  <span className="w-3 h-3 rounded-full bg-white" /> Start Recording
                </button>
              )}
              {recording && (
                <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white font-semibold rounded-xl hover:bg-neutral-900 transition-colors">
                  <StopCircle className="w-4 h-4" /> Stop Recording
                  <span className="font-mono text-sm text-neutral-300">{formatTime(elapsed)}</span>
                </button>
              )}
              {recordedBlob && (
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
