"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Zap, Share2, Mic, Video, Clock, ArrowRight, CheckCircle,
  Lock, Loader2, Mail, TrendingUp, Star
} from "lucide-react";

type DemoData = {
  id: string;
  name: string;
  email: string;
  website: string;
  brand_data: {
    businessName: string;
    tagline: string;
    description: string;
    primaryColor: string;
  };
  social_posts: { platform: string; content: string }[];
  audio_script: string;
  audio_url: string | null;
  video_script: string;
  video_url: string | null;
  email_verified: boolean;
  created_at: string;
};

type DiscountTier = {
  label: string;
  percent: number;
  originalPrice: number;
  discountedPrice: number;
  couponCode: string;
  expiresAt: Date;
  nextTierAt: Date | null;
};

function getDiscountTier(createdAt: string): DiscountTier {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursElapsed = (now - created) / (1000 * 60 * 60);
  const original = 745;

  const tiers = [
    { maxHours: 1,  percent: 50, label: "50% off — you just saw your demo!", couponCode: "DEMO50" },
    { maxHours: 3,  percent: 40, label: "40% off your first month",           couponCode: "DEMO40" },
    { maxHours: 12, percent: 30, label: "30% off your first month",           couponCode: "DEMO30" },
    { maxHours: 24, percent: 20, label: "20% off your first month",           couponCode: "DEMO20" },
    { maxHours: 48, percent: 10, label: "$50 off your first month",           couponCode: "DEMO10" },
  ];

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (hoursElapsed < t.maxHours) {
      const expiresAt = new Date(created + t.maxHours * 60 * 60 * 1000);
      const nextTierAt = i + 1 < tiers.length ? new Date(created + tiers[i + 1].maxHours * 60 * 60 * 1000) : null;
      const discountedPrice = Math.round(original * (1 - t.percent / 100));
      return { ...t, originalPrice: original, discountedPrice, expiresAt, nextTierAt };
    }
  }

  const expiresAt = new Date(created + 48 * 60 * 60 * 1000);
  return { percent: 0, label: "Standard pricing", couponCode: "", originalPrice: original, discountedPrice: original, expiresAt, nextTierAt: null };
}

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function update() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("00:00:00"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);
  return timeLeft;
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "bg-pink-100 text-pink-700",
  Facebook:  "bg-blue-100 text-blue-700",
  LinkedIn:  "bg-blue-100 text-blue-800",
  X:         "bg-neutral-100 text-neutral-700",
};

function PlanComparisonTable({ signupUrl, liteUrl }: { signupUrl: string; liteUrl: string }) {
  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-6 pt-6 pb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">Get this every month</p>
        <h3 className="text-2xl font-bold text-white">Pick your plan</h3>
        <p className="text-neutral-400 text-sm mt-1">Same AI onboarding · Cancel anytime · Setup in 24h</p>
      </div>

      <div className="grid grid-cols-3 gap-0 px-6 pb-2 text-xs font-semibold uppercase tracking-wide">
        <div className="text-neutral-500">What you get</div>
        <div className="text-center text-neutral-300">Lite <span className="text-neutral-500 font-normal normal-case">$99/mo</span></div>
        <div className="text-center text-primary-400">Full <span className="text-neutral-400 font-normal normal-case">$745/mo</span></div>
      </div>

      {[
        { feature: "Social posts/month",    lite: "30",   full: "150",  highlight: true },
        { feature: "Podcast episodes/month", lite: "1",    full: "2",    highlight: false },
        { feature: "AI videos/month",       lite: "1",    full: "4",    highlight: true },
        { feature: "Platforms covered",     lite: "3",    full: "5",    highlight: false },
        { feature: "Monthly report",        lite: "—",    full: "✓",    highlight: false },
        { feature: "Priority support",      lite: "—",    full: "✓",    highlight: false },
      ].map((row, i) => (
        <div key={row.feature} className={`grid grid-cols-3 gap-0 px-6 py-3 ${i % 2 === 0 ? "bg-white/5" : ""}`}>
          <span className="text-neutral-400 text-sm">{row.feature}</span>
          <span className="text-center text-neutral-300 text-sm font-medium">{row.lite}</span>
          <span className={`text-center text-sm font-bold ${row.highlight ? "text-primary-400" : "text-white"}`}>{row.full}</span>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4 p-6 pt-4">
        <Link href={liteUrl}
          className="py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center transition-colors text-sm">
          Start Lite — $99/mo
        </Link>
        <Link href={signupUrl}
          className="py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-center transition-colors text-sm">
          Go Full — $745/mo →
        </Link>
      </div>

      <div className="flex items-center justify-center gap-6 pb-5">
        {["No contracts", "Cancel anytime", "14-day free trial"].map(t => (
          <span key={t} className="flex items-center gap-1 text-xs text-neutral-500">
            <CheckCircle className="w-3 h-3 text-green-500" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DemoResultsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";

  const [demo, setDemo] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "audio" | "video">("posts");
  const [showPostsUpsell, setShowPostsUpsell] = useState(false);

  // Email verify state
  const [sendingVerify, setSendingVerify] = useState(false);
  const [verifySent, setVerifySent] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const loadDemo = useCallback(async () => {
    try {
      const res = await fetch(`/api/demo/status/${id}`);
      const data = await res.json();
      if (data.demo) setDemo(data.demo);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDemo(); }, [loadDemo]);

  // Show posts upsell after scrolling through posts
  useEffect(() => {
    if (activeTab !== "posts") return;
    const timer = setTimeout(() => setShowPostsUpsell(true), 8000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  async function sendVerifyEmail() {
    if (!demo) return;
    setSendingVerify(true);
    setVerifyError("");
    try {
      const res = await fetch("/api/demo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoId: demo.id }),
      });
      const data = await res.json();
      if (data.alreadyVerified) {
        setDemo(d => d ? { ...d, email_verified: true } : d);
      } else if (!res.ok) {
        setVerifyError("Failed to send — please try again.");
      } else {
        setVerifySent(true);
      }
    } catch {
      setVerifyError("Something went wrong.");
    } finally {
      setSendingVerify(false);
    }
  }

  const discount = demo ? getDiscountTier(demo.created_at) : null;
  const countdown = useCountdown(discount?.expiresAt ?? new Date());

  const businessName = demo?.brand_data?.businessName ?? demo?.website ?? "your business";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Zap className="w-8 h-8 text-primary-600 mx-auto animate-pulse" />
          <p className="text-neutral-500">Loading your results…</p>
        </div>
      </div>
    );
  }

  if (!demo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-neutral-500 mb-4">Demo not found or still generating.</p>
          <Link href="/demo" className="text-primary-600 hover:underline">Start a new demo →</Link>
        </div>
      </div>
    );
  }

  const signupUrl = `/sign-up?plan=full${discount?.couponCode ? `&coupon=${discount.couponCode}` : ""}&email=${encodeURIComponent(demo.email)}`;
  const liteUrl  = `/sign-up?plan=lite&email=${encodeURIComponent(demo.email)}`;
  const isVerified = demo.email_verified;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 sm:pb-0">

      {/* Nav */}
      <nav className="bg-white border-b border-neutral-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="PulseFlow" width={140} height={47} className="h-9 w-auto" />
          </Link>
          {discount && discount.percent > 0 && (
            <Link href={signupUrl}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors text-sm">
              Get {discount.percent}% Off — {countdown} left <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </nav>

      {/* Just verified banner */}
      {justVerified && (
        <div className="bg-green-600 text-white px-4 py-3 text-center text-sm font-semibold">
          ✅ Email verified! Your custom AI video is rendering — check back in a few minutes.
        </div>
      )}

      {/* Discount banner */}
      {discount && discount.percent > 0 && (
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-4 py-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-bold text-lg">{discount.label}</p>
              <p className="text-primary-100 text-sm">
                First month: <span className="line-through text-primary-300">${discount.originalPrice}</span>{" "}
                <span className="text-white font-bold text-xl">${discount.discountedPrice}</span>
                {discount.nextTierAt && (
                  <span className="ml-2 text-primary-200 text-xs">· drops to next tier in {countdown}</span>
                )}
              </p>
            </div>
            <Link href={signupUrl}
              className="flex-shrink-0 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors">
              Claim {discount.percent}% Off Now →
            </Link>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-sm text-neutral-500 mb-1">Sample content for</p>
          <h1 className="text-3xl font-bold text-neutral-900">{businessName}</h1>
          {demo.brand_data?.tagline && <p className="text-neutral-500 mt-1">{demo.brand_data.tagline}</p>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-200 rounded-xl p-1 w-fit">
          {([
            { key: "posts", label: "Social Posts", icon: Share2 },
            { key: "audio", label: "Podcast",      icon: Mic },
            { key: "video", label: "AI Video",     icon: Video },
          ] as const).map(t => {
            const locked = t.key === "video" && !isVerified;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === t.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}>
                {locked ? <Lock className="w-4 h-4" /> : <t.icon className="w-4 h-4" />}
                {t.label}
                {locked && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Verify</span>}
              </button>
            );
          })}
        </div>

        {/* Social Posts */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {(demo.social_posts ?? []).map((post, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLATFORM_COLORS[post.platform] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {post.platform}
                  </span>
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}

            {/* Volume upsell — appears after 8s */}
            {showPostsUpsell && (
              <div className="bg-gradient-to-r from-indigo-50 to-primary-50 border border-primary-200 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-neutral-900 text-sm">You just saw 5 sample posts.</p>
                  <p className="text-neutral-600 text-sm mt-0.5">
                    Full gives <strong>{businessName}</strong> <strong className="text-primary-700">150 posts every month</strong> — that&apos;s a branded post every single day across every platform.
                  </p>
                  <Link href={signupUrl}
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors">
                    Get 150 Posts/Month <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio */}
        {activeTab === "audio" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">2-Minute Podcast Sample</p>
                  <p className="text-xs text-neutral-500">AI voice narration for {businessName}</p>
                </div>
              </div>
              {demo.audio_url ? (
                <audio controls className="w-full mt-2">
                  <source src={demo.audio_url} type="audio/mpeg" />
                </audio>
              ) : (
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-xs text-neutral-500 mb-2 font-semibold uppercase tracking-wide">Script</p>
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{demo.audio_script}</p>
                </div>
              )}
            </div>
            {/* Podcast upsell */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex gap-4 items-start">
              <Mic className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">This is 1 sample episode.</p>
                <p className="text-neutral-600 text-sm mt-0.5">Full gives you <strong className="text-purple-700">26 podcast episodes a year</strong> — bi-weekly, fully produced, ready to publish.</p>
                <Link href={signupUrl}
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors">
                  Get 26 Episodes/Year <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Video */}
        {activeTab === "video" && (
          isVerified ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Your Custom AI Presenter Video</p>
                    <p className="text-xs text-neutral-500">Personalized for {businessName}</p>
                  </div>
                </div>
                {demo.video_url ? (
                  <video controls className="w-full rounded-xl">
                    <source src={demo.video_url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-amber-800">Your video is being rendered</p>
                    <p className="text-xs text-amber-700">HeyGen usually takes 3–5 minutes. We&apos;ll email you the moment it&apos;s ready.</p>
                    <div className="bg-neutral-50 rounded-xl p-4 mt-3 text-left">
                      <p className="text-xs text-neutral-500 mb-1 font-semibold uppercase tracking-wide">Video Script</p>
                      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{demo.video_script}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Post-verify upsell */}
              {justVerified && (
                <div className="bg-gradient-to-br from-rose-50 to-primary-50 border border-rose-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-rose-500" />
                    <p className="font-bold text-neutral-900">While your video renders — here&apos;s what Full gives you monthly</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Share2 className="w-4 h-4 text-indigo-500" />, label: "150 social posts", sub: "across 5 platforms" },
                      { icon: <Mic className="w-4 h-4 text-purple-500" />,   label: "2 podcast episodes", sub: "bi-weekly, fully produced" },
                      { icon: <Video className="w-4 h-4 text-rose-500" />,   label: "4 AI videos", sub: "HeyGen presenter quality" },
                      { icon: <TrendingUp className="w-4 h-4 text-teal-500" />, label: "Monthly report", sub: "performance + strategy" },
                    ].map(item => (
                      <div key={item.label} className="bg-white rounded-xl p-3 flex items-start gap-2 border border-neutral-100">
                        <div className="mt-0.5">{item.icon}</div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                          <p className="text-xs text-neutral-500">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href={signupUrl}
                    className="block w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-center transition-colors">
                    Get All of This Every Month {discount?.percent ? `— ${discount.percent}% Off` : ""} →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-neutral-300 p-10 text-center space-y-5">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Unlock Your Custom AI Video</h3>
                <p className="text-neutral-500 text-sm mt-2 max-w-sm mx-auto">
                  Verify your email and we&apos;ll render a personalized HeyGen presenter video for <strong>{businessName}</strong> — featuring your actual brand, services, and message.
                </p>
              </div>
              <div className="bg-neutral-50 rounded-xl px-5 py-3 inline-flex items-center gap-2 text-sm text-neutral-600">
                <Mail className="w-4 h-4 text-neutral-400" />
                Sending to <strong>{demo.email}</strong>
              </div>
              {verifySent ? (
                <div className="flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  Check your inbox — click the link to unlock your video!
                </div>
              ) : (
                <button onClick={sendVerifyEmail} disabled={sendingVerify}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-base">
                  {sendingVerify
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>
                    : <><Mail className="w-5 h-5" /> Send Verification Email → Get My Video</>}
                </button>
              )}
              {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
              <p className="text-xs text-neutral-400">Free · No credit card · Just verifying it&apos;s really you</p>
            </div>
          )
        )}

        {/* Personalized upgrade moment */}
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">Imagine this</p>
            <h2 className="text-2xl font-bold text-neutral-900">
              Every month for <span className="text-primary-600">{businessName}</span>
            </h2>
            <p className="text-neutral-500 text-sm mt-1 max-w-md mx-auto">
              This demo was a single sample. A subscription delivers this — and much more — on autopilot every 30 days.
            </p>
          </div>
          <PlanComparisonTable signupUrl={signupUrl} liteUrl={liteUrl} />
        </div>

      </main>

      {/* Sticky mobile discount bar */}
      {discount && discount.percent > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-primary-600 text-white px-4 py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-200 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">{discount.percent}% off expires in {countdown}</p>
              <p className="text-xs text-primary-200">First month: <span className="line-through">${discount.originalPrice}</span> ${discount.discountedPrice}</p>
            </div>
          </div>
          <Link href={signupUrl}
            className="flex-shrink-0 px-4 py-2 bg-white text-primary-700 font-bold rounded-lg text-sm">
            Claim →
          </Link>
        </div>
      )}

    </div>
  );
}
