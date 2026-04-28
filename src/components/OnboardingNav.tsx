import Link from "next/link";
import { Zap } from "lucide-react";

type Step = "sign-up" | "schedule" | "welcome" | "brand-assets" | "choose-avatar" | "choose-voice" | "interview" | "complete";

const steps: { key: Step; label: string; href: string }[] = [
  { key: "welcome", label: "Welcome", href: "/onboarding/welcome" },
  { key: "brand-assets", label: "Brand Assets", href: "/onboarding/brand-assets" },
  { key: "choose-avatar", label: "Your Avatar", href: "/onboarding/choose-avatar" },
  { key: "choose-voice", label: "Your Voice", href: "/onboarding/choose-voice" },
  { key: "interview", label: "Brand Interview", href: "/onboarding/interview" },
  { key: "complete", label: "Complete", href: "/onboarding/complete" },
];

export default function OnboardingNav({ current }: { current: Step }) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-neutral-900 tracking-tight">
              PulseCommand
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {steps.map((step, i) => (
              <span
                key={step.key}
                className={`font-medium text-sm pb-0.5 ${
                  step.key === current
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : i < currentIndex
                    ? "text-neutral-500"
                    : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">Already have an account?</span>
            <Link
              href="#"
              className="px-4 py-2 text-primary-600 font-medium border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
