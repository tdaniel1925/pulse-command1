import Link from "next/link";
import OnboardingNav from "@/components/OnboardingNav";
import { Check, Clock, ArrowRight } from "lucide-react";

const timeline = [
  { label: "Within 24 hours", detail: "Your brand profile will be reviewed" },
  { label: "Within 48 hours", detail: "Your first content batch will be generated" },
  { label: "Within 72 hours", detail: "Your landing pages will go live" },
  { label: "Week 1", detail: "Your first AI video will be ready for review" },
  { label: "Month end", detail: "Your first performance report" },
];

const confettiDots = [
  { top: "8%", left: "6%", size: 14, color: "#2563eb" },
  { top: "12%", left: "18%", size: 9, color: "#16a34a" },
  { top: "5%", left: "40%", size: 12, color: "#d97706" },
  { top: "14%", left: "62%", size: 8, color: "#7c3aed" },
  { top: "7%", left: "78%", size: 14, color: "#0891b2" },
  { top: "10%", left: "90%", size: 10, color: "#e11d48" },
  { top: "80%", left: "4%", size: 10, color: "#16a34a" },
  { top: "75%", left: "15%", size: 14, color: "#d97706" },
  { top: "88%", left: "30%", size: 8, color: "#2563eb" },
  { top: "82%", left: "55%", size: 12, color: "#7c3aed" },
  { top: "78%", left: "72%", size: 9, color: "#e11d48" },
  { top: "85%", left: "88%", size: 14, color: "#0891b2" },
  { top: "35%", left: "2%", size: 8, color: "#d97706" },
  { top: "55%", left: "96%", size: 10, color: "#16a34a" },
];

export default function OnboardingCompletePage() {
  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      {/* Confetti dots */}
      {confettiDots.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full opacity-70 pointer-events-none"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
          }}
        />
      ))}

      <OnboardingNav current="interview" />

      <main className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        {/* Success icon */}
        <div className="w-24 h-24 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center mb-6 shadow-sm">
          <Check className="w-12 h-12 text-green-600" strokeWidth={2.5} />
        </div>

        <h1 className="text-4xl font-extrabold text-neutral-900 mb-3">You&apos;re all set!</h1>
        <p className="text-lg text-neutral-500 mb-10">Your content machine is warming up.</p>

        {/* Timeline */}
        <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-8 text-left">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">What happens next</p>
          <ul className="flex flex-col gap-4">
            {timeline.map(({ label, detail }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{label}</p>
                  <p className="text-sm text-neutral-500">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-base"
        >
          Go to Your Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </main>
    </div>
  );
}
