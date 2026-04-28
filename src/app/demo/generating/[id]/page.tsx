"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Zap, CheckCircle, Loader2 } from "lucide-react";

const STEPS = [
  { key: "scanning", label: "Scanning your website" },
  { key: "profiling", label: "Building your brand profile" },
  { key: "posts", label: "Writing your social posts" },
  { key: "audio", label: "Rendering your podcast sample" },
  { key: "video", label: "Generating your AI presenter video" },
  { key: "notifying", label: "Sending your notification" },
];

export default function GeneratingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Animate steps visually regardless of actual backend progress
    const intervals: ReturnType<typeof setTimeout>[] = [];
    const delays = [0, 4000, 8000, 14000, 22000, 34000];
    delays.forEach((delay, i) => {
      intervals.push(setTimeout(() => setCurrentStep(i), delay));
    });
    return () => intervals.forEach(clearInterval);
  }, []);

  useEffect(() => {
    // Poll for completion
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/demo/status/${id}`);
        const data = await res.json();
        if (data.status === "done") {
          clearInterval(poll);
          setDone(true);
          setTimeout(() => router.push(`/demo/results/${id}`), 1500);
        }
      } catch { /* ignore */ }
    }, 8000);
    return () => clearInterval(poll);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <nav className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Image src="/logo-white.png" alt="PulseFlow" width={140} height={47} className="h-9 w-auto" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          {done ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Your content is ready!</h1>
                <p className="text-neutral-500 mt-2">Taking you to your results…</p>
              </div>
            </>
          ) : (
            <>
              {/* Animated logo pulse */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-primary-600 rounded-full opacity-20 animate-ping" />
                <div className="relative w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                  <Zap className="w-9 h-9 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Building your sample content…</h1>
                <p className="text-neutral-500 mt-2 text-sm">
                  This takes 3–5 minutes. We&apos;ll email you when it&apos;s ready — feel free to close this tab.
                </p>
              </div>

              {/* Steps */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 text-left space-y-4">
                {STEPS.map((step, i) => {
                  const completed = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : active ? (
                          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-neutral-200" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        completed ? "text-neutral-500 line-through" :
                        active ? "text-neutral-900" : "text-neutral-400"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-neutral-400">
                Already have an account?{" "}
                <Link href="/login" className="text-primary-600 hover:underline">Sign in →</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
