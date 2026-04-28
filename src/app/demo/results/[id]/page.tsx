"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Zap, Share2, Mic, Video, Clock, ArrowRight, CheckCircle } from "lucide-react";

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
  created_at: string;
};

type DiscountTier = {
  label: string;
  percent: number;
  originalPrice: number;
  discountedPrice: number;
  couponCode: string;
};

function getDiscountTier(createdAt: string): DiscountTier & { expiresAt: Date; nextTierAt: Date | null } {
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

  const tierBoundaries = [1, 3, 12, 24, 48];

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (hoursElapsed < t.maxHours) {
      const expiresAt = new Date(created + t.maxHours * 60 * 60 * 1000);
      const nextTierAt = i + 1 < tiers.length ? new Date(created + tiers[i + 1].maxHours * 60 * 60 * 1000) : null;
      const discountedPrice = Math.round(original * (1 - t.percent / 100));
      return { ...t, originalPrice: original, discountedPrice, expiresAt, nextTierAt };
    }
  }

  // Expired — no discount
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
  Facebook: "bg-blue-100 text-blue-700",
  LinkedIn: "bg-blue-100 text-blue-800",
  X: "bg-neutral-100 text-neutral-700",
};

export default function DemoResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [demo, setDemo] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "audio" | "video">("posts");

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

  const discount = demo ? getDiscountTier(demo.created_at) : null;
  const countdown = useCountdown(discount?.expiresAt ?? new Date());

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

  const signupUrl = discount?.couponCode
    ? `/sign-up?coupon=${discount.couponCode}&email=${encodeURIComponent(demo.email)}`
    : `/sign-up?email=${encodeURIComponent(demo.email)}`;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav */}
      <nav className="bg-white border-b border-neutral-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-neutral-900">PulseCommand</span>
          </Link>
          {discount && discount.percent > 0 && (
            <Link
              href={signupUrl}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Get {discount.percent}% Off — {countdown} left <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </nav>

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
                  <span className="ml-2 text-primary-200 text-xs">· drops to next tier at {countdown}</span>
                )}
              </p>
            </div>
            <Link
              href={signupUrl}
              className="flex-shrink-0 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors"
            >
              Claim {discount.percent}% Off Now →
            </Link>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <p className="text-sm text-neutral-500 mb-1">Sample content for</p>
          <h1 className="text-3xl font-bold text-neutral-900">{demo.brand_data?.businessName ?? demo.website}</h1>
          {demo.brand_data?.tagline && <p className="text-neutral-500 mt-1">{demo.brand_data.tagline}</p>}
        </div>

        {/* Content tabs */}
        <div className="flex gap-1 bg-neutral-200 rounded-xl p-1 w-fit">
          {([
            { key: "posts", label: "Social Posts", icon: Share2 },
            { key: "audio", label: "Podcast", icon: Mic },
            { key: "video", label: "Video", icon: Video },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
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
          </div>
        )}

        {/* Audio */}
        {activeTab === "audio" && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">2-Minute Podcast Sample</p>
                <p className="text-xs text-neutral-500">AI voice narration for {demo.brand_data?.businessName}</p>
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
        )}

        {/* Video */}
        {activeTab === "video" && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">AI Presenter Video Sample</p>
                <p className="text-xs text-neutral-500">HeyGen avatar presenting for {demo.brand_data?.businessName}</p>
              </div>
            </div>
            {demo.video_url ? (
              <video controls className="w-full rounded-xl">
                <source src={demo.video_url} type="video/mp4" />
              </video>
            ) : (
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-2 font-semibold uppercase tracking-wide">Video Script</p>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{demo.video_script}</p>
                <p className="text-xs text-neutral-400 mt-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> HeyGen rendering in progress — check back shortly or sign up to receive it.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sign up CTA */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Get this every month</p>
          <h2 className="text-2xl font-bold">150 posts. 26 podcast episodes. 4 videos. Monthly reports.</h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            This was just a taste. Subscribe to PulseCommand and get a full content machine for your brand — every single month.
          </p>

          {discount && discount.percent > 0 ? (
            <div className="space-y-3">
              <div className="inline-flex flex-col items-center bg-white/10 rounded-xl px-6 py-4">
                <p className="text-neutral-300 text-sm">First month — <span className="line-through">${discount.originalPrice}</span></p>
                <p className="text-4xl font-bold text-white">${discount.discountedPrice}</p>
                <p className="text-neutral-400 text-xs mt-1">then ${discount.originalPrice}/mo · cancel anytime</p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-amber-300 text-sm font-semibold">
                <Clock className="w-4 h-4" />
                {discount.percent}% discount expires in {countdown}
              </div>
              <Link
                href={signupUrl}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-colors text-lg"
              >
                Claim {discount.percent}% Off — Sign Up Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <Link
              href={signupUrl}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Get Started — $745/mo <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          <div className="flex items-center justify-center gap-6 pt-2">
            {["No contracts", "Cancel anytime", "Setup in 24h"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-neutral-400">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
