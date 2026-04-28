"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, User, Mail, Building2, Shield, Zap, Share2, Mic, Video, BarChart3, AlertCircle, Phone } from "lucide-react";
import OnboardingNav from "@/components/OnboardingNav";

const included = [
  { icon: <Share2 className="w-4 h-4 text-indigo-600" />, text: "150 social posts/month across 5 channels" },
  { icon: <Mic className="w-4 h-4 text-purple-600" />, text: "Bi-weekly AI voice podcast (26 eps/year)" },
  { icon: <Video className="w-4 h-4 text-rose-600" />, text: "4 HeyGen AI presenter videos per month" },
  { icon: <BarChart3 className="w-4 h-4 text-teal-600" />, text: "Monthly performance report & review" },
];

const inputClass = "w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm";
const inputWithIconClass = "w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, businessName, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      window.location.href = "/onboarding/welcome";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <OnboardingNav current="sign-up" />

      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex items-center">
              {["Create Account", "Schedule", "Welcome"].map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-2 ${i === 0 ? "text-primary-600" : "text-neutral-400"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-500"}`}>
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-0.5 mx-3 bg-neutral-200" />}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Details */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" /> Account Details
                  </h2>

                  {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg mb-6">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Smith"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@company.com"
                          required
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Acme Co."
                          required
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Phone <span className="text-neutral-400 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* No payment needed to start */}
                <div className="bg-green-50 rounded-2xl border border-green-200 p-6 flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">No payment required to start</p>
                    <p className="text-sm text-green-700 mt-1">Your 14-day free trial begins the moment you create your account. We&apos;ll collect payment details after your trial — no credit card needed now.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full py-4 bg-primary-600 text-white font-bold rounded-xl text-center hover:bg-primary-700 transition-colors shadow-lg text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Account & Get Started →"}
                </button>

                <p className="text-center text-xs text-neutral-500">
                  By creating an account you agree to our{" "}
                  <a href="mailto:support@pulsecommand.com" className="text-primary-600 hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="mailto:support@pulsecommand.com" className="text-primary-600 hover:underline">Privacy Policy</a>.
                  Setup begins within 24 hours.
                </p>
              </div>

              {/* Right: Order Summary */}
              <div className="space-y-5">
                <div className="bg-neutral-900 rounded-2xl p-6 sticky top-24 text-white">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">PulseCommand</p>
                      <p className="text-neutral-400 text-xs">Complete AI Marketing Service</p>
                    </div>
                  </div>

                  <div className="mb-5 pb-5 border-b border-neutral-800">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-4xl font-bold">$745</span>
                        <span className="text-neutral-400">/mo</span>
                      </div>
                      <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">No lock-in</span>
                    </div>
                    <p className="text-neutral-500 text-xs mt-1">First charge after 14-day free trial</p>
                  </div>

                  <div className="space-y-3 mb-5">
                    {included.map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          {icon}
                        </div>
                        <span className="text-neutral-300 text-xs leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-800 pt-5 space-y-2">
                    <div className="flex justify-between text-sm text-neutral-400">
                      <span>14-day free trial</span>
                      <span className="text-green-400 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                      <span>Due today</span>
                      <span>$0.00</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-neutral-800 space-y-2">
                    {["14-day free trial included", "Cancel anytime, no fees", "Setup within 24 hours"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-neutral-400">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
