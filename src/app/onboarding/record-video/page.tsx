"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import { Video, StopCircle, RotateCcw, Upload, Camera, Loader2 } from "lucide-react";

const SCRIPT = `Hi, my name is [Your Name] and I'm the founder of [Business Name].

At [Business Name], we believe that every homeowner deserves access to honest, expert service they can trust. We've spent years building a reputation in this community for doing the job right the first time — no shortcuts, no surprises on the bill.

Whether you're dealing with an urgent repair or planning something big, our team shows up on time, walks you through every option, and treats your home like it's our own.

If you're looking for a partner you can count on — not just a contractor — I'd love to show you what we're about. Give us a call or visit our website. We'd be honoured to earn your trust.`;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function RecordVideoPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
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

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
    const mr = new MediaRecorder(streamRef.current);
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
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
    await new Promise((r) => setTimeout(r, 2000));
    router.push("/onboarding/record-audio");
  }

  useEffect(() => {
    if (previewUrl && previewRef.current) {
      previewRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <OnboardingNav current="interview" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4">
            <Video className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Record Your Avatar Video</h1>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
            Record a 3-minute video reading the script below. Speak naturally, look at the camera. Good lighting is important.
          </p>
        </div>

        {/* Script card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-6">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Your Script</p>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{SCRIPT}</p>
        </div>

        {/* Video area */}
        <div className="bg-black rounded-2xl overflow-hidden mb-6 aspect-video flex items-center justify-center relative">
          {!recordedBlob ? (
            <>
              <video
                ref={videoRef}
                muted
                playsInline
                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />
              {!cameraActive && (
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <Camera className="w-12 h-12" />
                  <p className="text-sm">Camera not active</p>
                </div>
              )}
              {recording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-semibold">Recording</span>
                  <span className="text-red-400 text-xs font-mono">{formatTime(elapsed)}</span>
                </div>
              )}
              {cameraActive && !recording && (
                <div className="absolute top-4 left-4 bg-black/60 rounded-full px-3 py-1.5">
                  <span className="text-white text-xs font-semibold">Live Preview</span>
                </div>
              )}
            </>
          ) : (
            <video
              ref={previewRef}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
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
          {!cameraActive && !recordedBlob && (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          )}

          {cameraActive && !recording && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              <span className="w-3 h-3 rounded-full bg-white" />
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

          {recordedBlob && (
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
