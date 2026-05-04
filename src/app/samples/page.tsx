"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Share2, Mic, Video, BarChart3, Mail, FileText,
  MapPin, Play, Download, ExternalLink, ArrowRight,
  Smartphone, Star, TrendingUp, Users, Eye, Heart, MessageCircle,
  Loader2, ImageIcon, Sparkles
} from "lucide-react";

// Brand icons not in this version of lucide-react
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Sample data ─────────────────────────────────────── */

const FALLBACK_IMAGES: Record<string, string> = {
  instagram_roofing: "/samples/set1-instagram.jpg",
  linkedin_commercial: "/samples/set1-linkedin.jpg",
  facebook_inspection: "/samples/set1-facebook.jpg",
  reel_brand_story: "/samples/set1-reel-brand.jpg",
  reel_process: "/samples/set1-reel-process.jpg",
  reel_tips: "/samples/set1-reel-tips.jpg",
  reel_testimonial: "/samples/set1-reel-testimonial.jpg",
};

const socialPostsData = [
  {
    platform: "Instagram",
    handle: "@oakridge_roofing",
    Icon: IconInstagram,
    iconColor: "text-pink-500",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    time: "2h ago",
    imageKey: "instagram_roofing",
    imageAlt: "Residential roof being replaced",
    content: "Your roof is working harder than you think. Extreme heat, heavy rain, and UV exposure take a toll year-round. Our 48-hour inspection service gives you peace of mind — before small issues become expensive problems. 🏠✅",
    hashtags: "#roofing #homemaintenance #protectyourhome #commercialroofing #OakRidgeRoofing",
    likes: 142,
    comments: 18,
    reach: "4.2K",
  },
  {
    platform: "LinkedIn",
    handle: "Oakridge Roofing Solutions",
    Icon: IconLinkedin,
    iconColor: "text-blue-600",
    gradient: "from-blue-600 to-blue-700",
    time: "1d ago",
    imageKey: "linkedin_commercial",
    imageAlt: "Construction crew on a commercial roof",
    content: "We recently completed a 22,000 sq ft commercial re-roof for a regional distribution center in under 6 days — without interrupting operations. How? Pre-fabricated sections, night crews, and 20 years of commercial experience. If your facility needs a roof upgrade, let's talk.",
    hashtags: "#commercialroofing #facilitymanagement #constructionmanagement #B2B",
    likes: 87,
    comments: 24,
    reach: "3.1K",
  },
  {
    platform: "Facebook",
    handle: "Oakridge Roofing",
    Icon: IconFacebook,
    iconColor: "text-blue-500",
    gradient: "from-blue-500 to-blue-600",
    time: "3d ago",
    imageKey: "facebook_inspection",
    imageAlt: "Beautiful home exterior",
    content: "Did you know most roof leaks start 6–12 months before they're visible inside your home? Our thermal imaging inspection finds moisture intrusion before water damage begins. Book a free inspection this week — spots are limited! 👇",
    hashtags: "#roofrepair #homeowners #freeInspection #roofingexperts",
    likes: 213,
    comments: 41,
    reach: "8.7K",
  },
];

const podcastEpisodes = [
  {
    episode: "Ep. 12",
    title: "Why Most Businesses Fail at Local SEO (And How to Fix It in 30 Days)",
    duration: "18:42",
    desc: "A deep dive into the three biggest local SEO mistakes we see small businesses make — and the exact playbook to recover fast.",
    progress: 35,
    link: "https://www.buzzsprout.com/",
  },
  {
    episode: "Ep. 11",
    title: "The Social Media Posting Schedule That Actually Drives Leads",
    duration: "14:20",
    desc: "Most businesses post randomly and wonder why nothing happens. This episode breaks down the cadence, content mix, and platform priorities that move the needle.",
    progress: 0,
    link: "https://www.buzzsprout.com/",
  },
  {
    episode: "Ep. 10",
    title: "How to Turn One Video Into 30 Pieces of Content",
    duration: "21:05",
    desc: "Content repurposing isn't just a buzzword — it's the most efficient marketing lever available to small businesses. Here's the exact framework.",
    progress: 100,
    link: "https://www.buzzsprout.com/",
  },
];

const REEL_FALLBACK_GRADIENTS: Record<string, string> = {
  reel_brand_story: "from-primary-400 to-primary-700",
  reel_process: "from-accent-400 to-accent-600",
  reel_tips: "from-purple-400 to-purple-700",
  reel_testimonial: "from-green-400 to-teal-600",
};

const reelsData = [
  {
    label: "Brand Story",
    caption: "20 years. One family. Thousands of roofs. Here's why we do what we do. 🏠 #BrandStory #OakridgeRoofing",
    duration: "0:28",
    imageKey: "reel_brand_story",
    views: "12.4K",
    link: "https://www.youtube.com/shorts/wBnHqQXGBos",
  },
  {
    label: "Process Reel",
    caption: "Watch us transform this commercial roof in under 60 seconds ⚡ #TimeLapse #Roofing #CommercialConstruction",
    duration: "0:45",
    imageKey: "reel_process",
    views: "8.1K",
    link: "https://www.youtube.com/shorts/wBnHqQXGBos",
  },
  {
    label: "Tip / Value",
    caption: "3 signs your roof needs attention RIGHT NOW 👆 Save this post! #RoofingTips #HomeOwner #DIY",
    duration: "0:31",
    imageKey: "reel_tips",
    views: "21.7K",
    link: "https://www.youtube.com/shorts/wBnHqQXGBos",
  },
  {
    label: "Testimonial",
    caption: "\"They were done in one day and cleaned up everything\" — Sarah M. ⭐⭐⭐⭐⭐ #CustomerLove #Roofing",
    duration: "0:22",
    imageKey: "reel_testimonial",
    views: "5.3K",
    link: "https://www.youtube.com/shorts/wBnHqQXGBos",
  },
];

const reportMetrics = [
  { label: "Total Reach", value: "48,300", change: "+18%", up: true },
  { label: "Engagement Rate", value: "4.7%", change: "+0.9%", up: true },
  { label: "Profile Visits", value: "2,140", change: "+31%", up: true },
  { label: "Leads Generated", value: "23", change: "+5", up: true },
];

/* ─── Page ────────────────────────────────────────────── */

const SESSION_LIMIT = 2;

// All 4 image sets — images swap instantly, no API call needed
const IMAGE_SETS: Record<string, string>[] = [
  { instagram_roofing: '/samples/set1-instagram.jpg', linkedin_commercial: '/samples/set1-linkedin.jpg', facebook_inspection: '/samples/set1-facebook.jpg', reel_brand_story: '/samples/set1-reel-brand.jpg', reel_process: '/samples/set1-reel-process.jpg', reel_tips: '/samples/set1-reel-tips.jpg', reel_testimonial: '/samples/set1-reel-testimonial.jpg' },
  { instagram_roofing: '/samples/set2-instagram.jpg', linkedin_commercial: '/samples/set2-linkedin.jpg', facebook_inspection: '/samples/set2-facebook.jpg', reel_brand_story: '/samples/set2-reel-brand.jpg', reel_process: '/samples/set2-reel-process.jpg', reel_tips: '/samples/set2-reel-tips.jpg', reel_testimonial: '/samples/set2-reel-testimonial.jpg' },
  { instagram_roofing: '/samples/set3-instagram.jpg', linkedin_commercial: '/samples/set3-linkedin.jpg', facebook_inspection: '/samples/set3-facebook.jpg', reel_brand_story: '/samples/set3-reel-brand.jpg', reel_process: '/samples/set3-reel-process.jpg', reel_tips: '/samples/set3-reel-tips.jpg', reel_testimonial: '/samples/set3-reel-testimonial.jpg' },
  { instagram_roofing: '/samples/set4-instagram.jpg', linkedin_commercial: '/samples/set4-linkedin.jpg', facebook_inspection: '/samples/set4-facebook.jpg', reel_brand_story: '/samples/set4-reel-brand.jpg', reel_process: '/samples/set4-reel-process.jpg', reel_tips: '/samples/set4-reel-tips.jpg', reel_testimonial: '/samples/set4-reel-testimonial.jpg' },
];

export default function SamplesPage() {
  const [currentSet, setCurrentSet] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>(IMAGE_SETS[0]);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [generatingText, setGeneratingText] = useState(false);
  const [genError, setGenError] = useState("");
  const [sessionCount, setSessionCount] = useState(0);

  // Check for cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem("sample_data");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.setIndex != null) {
          setCurrentSet(parsed.setIndex);
          setGeneratedImages(IMAGE_SETS[parsed.setIndex] ?? IMAGE_SETS[0]);
        }
        if (parsed.content) setGeneratedContent(parsed.content);
      } catch {}
    }
  }, []);

  async function handleGenerate() {
    if (sessionCount >= SESSION_LIMIT) {
      setGenError("You've used both generations for this session. Refresh the page to reset.");
      return;
    }
    setGenError("");

    // 1. Instantly swap to next image set (no API call)
    const nextSet = (currentSet + 1) % IMAGE_SETS.length;
    setCurrentSet(nextSet);
    setGeneratedImages(IMAGE_SETS[nextSet]);

    // 2. Clear old text and show skeleton while Claude generates new text
    setGeneratedContent(null);
    setGeneratingText(true);
    setSessionCount(prev => prev + 1);

    // 3. Fetch fresh text from Claude in background
    try {
      const res = await fetch("/api/samples/generate-images", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (data.content) setGeneratedContent(data.content);
      localStorage.setItem("sample_data", JSON.stringify({
        setIndex: nextSet,
        content: data.content ?? null,
      }));
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate captions");
    } finally {
      setGeneratingText(false);
    }
  }

  function getImageUrl(key: string): string {
    return generatedImages[key] || FALLBACK_IMAGES[key] || "";
  }

  function getPostContent(platform: string): { content: string; hashtags: string } | null {
    return generatedContent?.posts?.[platform.toLowerCase()] ?? null;
  }

  function getReelCaption(key: string): string | null {
    const reelKey = key.replace('reel_', '');
    return generatedContent?.reels?.[reelKey] ?? null;
  }

  const remaining = SESSION_LIMIT - sessionCount;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%)",
          }}
        />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-primary-400 text-primary-400" /> Real output. Real brands. Just like yours.
          </div>
          <h1 className="text-5xl font-bold text-neutral-900 mb-5 tracking-tight">
            See What We{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-400">
              Actually Deliver
            </span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Every piece of content below was generated by AI — tailored to a real roofing business. Your brand gets the same treatment, built around your voice and your customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/demo"
              className="px-7 py-3.5 bg-accent-400 hover:bg-accent-500 text-white font-bold rounded-xl transition-all shadow-lg text-base">
              Get My Free Sample →
            </Link>
            <Link href="/#pricing"
              className="px-7 py-3.5 bg-white border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all shadow-sm">
              See Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Combined Section: Social Content ── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Share2 className="w-5 h-5 text-primary-600" />}
            iconBg="bg-primary-100"
            label="AI-Generated Social Content"
            title="Platform-Perfect Posts & Videos, Every Month"
            desc="We write differently for every platform — LinkedIn sounds professional, Instagram is visual and punchy, Facebook drives local engagement. Plus vertical videos for Reels, TikTok, and Shorts."
            count="Up to 150 posts + 4 videos/mo"
            countColor="bg-primary-50 text-primary-700 border-primary-200"
          />

          {/* Generate button */}
          <div className="flex flex-col items-center mt-8 gap-2">
            <button
              onClick={handleGenerate}
              disabled={generatingText || sessionCount >= SESSION_LIMIT}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base"
            >
              {generatingText ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating New Content…</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate New Social Content</>
              )}
            </button>
            {remaining > 0 && !generatingText && (
              <p className="text-neutral-400 text-xs">{remaining} generation{remaining !== 1 ? 's' : ''} remaining this session</p>
            )}
            {sessionCount >= SESSION_LIMIT && !generatingText && (
              <p className="text-amber-600 text-xs font-medium">Session limit reached (2 per session)</p>
            )}
            {genError && <p className="text-red-500 text-sm font-medium">{genError}</p>}
          </div>

          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .skeleton {
              background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s ease-in-out infinite;
            }
            @keyframes kenburns {
              0% { transform: scale(1) translate(0, 0); }
              25% { transform: scale(1.15) translate(-2%, -1%); }
              50% { transform: scale(1.1) translate(1%, -2%); }
              75% { transform: scale(1.2) translate(-1%, 1%); }
              100% { transform: scale(1) translate(0, 0); }
            }
            .reel-animate { animation: kenburns 8s ease-in-out infinite; }
            .reel-paused { animation-play-state: paused; }
            .reel-playing { animation-play-state: running; }
          `}</style>

          {/* Social Posts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {socialPostsData.map((post) => {
              const dynamic = getPostContent(post.platform);
              return (
              <div key={post.platform} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className={`h-1.5 bg-gradient-to-r ${post.gradient}`} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(post.imageKey)} alt={post.imageAlt} className="w-full h-48 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                      <post.Icon className={`w-5 h-5 ${post.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 text-sm">{post.handle}</p>
                      <p className="text-xs text-neutral-400">{post.time}</p>
                    </div>
                    <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${post.iconColor} bg-neutral-50 border-neutral-200`}>{post.platform}</span>
                  </div>
                  {/* Text or skeleton */}
                  {generatingText ? (
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 skeleton rounded w-full" />
                      <div className="h-3.5 skeleton rounded w-11/12" />
                      <div className="h-3.5 skeleton rounded w-9/12" />
                      <div className="mt-3 h-3 skeleton rounded w-7/12" />
                    </div>
                  ) : (
                    <>
                      <p className="text-neutral-700 text-sm leading-relaxed flex-1">{dynamic?.content ?? post.content}</p>
                      <p className="text-primary-500 text-xs mt-3 leading-relaxed">{dynamic?.hashtags ?? post.hashtags}</p>
                    </>
                  )}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments}</span>
                    <span className="flex items-center gap-1 ml-auto"><Eye className="w-3.5 h-3.5" /> {post.reach} reach</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Short Reels — same section */}
          <div className="mt-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 w-10 h-10 bg-accent-100 rounded-xl justify-center">
                <Smartphone className="w-5 h-5 text-accent-500" />
              </div>
              <span className="text-sm font-bold text-neutral-500 uppercase tracking-wide">Short Reels & TikToks</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full border bg-accent-50 text-accent-700 border-accent-200">Up to 4 videos/mo</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {reelsData.map((reel) => {
              const reelImage = getImageUrl(reel.imageKey);
              const fallbackGradient = REEL_FALLBACK_GRADIENTS[reel.imageKey];
              const dynamicCaption = getReelCaption(reel.imageKey);
              return (
              <ReelCard
                key={reel.label}
                reel={{ ...reel, caption: dynamicCaption ?? reel.caption }}
                reelImage={reelImage}
                fallbackGradient={fallbackGradient}
                generating={generatingText}
              />
              );
            })}
          </div>

          <p className="text-center text-neutral-400 text-sm mt-10">
            Each video is a unique AI presenter avatar — your brand voice, your message, zero production cost.
          </p>
        </div>
      </section>

      {/* ── Section: Podcast ── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Mic className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-100"
            label="AI Podcast"
            title="Your Voice. Your Authority. No Mic Required."
            desc="A bi-weekly podcast scripted for your brand and rendered with ElevenLabs voice AI. Each episode builds your authority and keeps your audience engaged between sales cycles."
            count="Up to 26 episodes/year"
            countColor="bg-purple-50 text-purple-700 border-purple-200"
          />

          <div className="mt-12 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
            {/* Podcast header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 flex items-center gap-4">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-300 font-semibold uppercase tracking-wide mb-1">Podcast Series</p>
                <h3 className="text-white font-bold text-xl leading-tight">The Oakridge Business Growth Podcast</h3>
                <p className="text-purple-200 text-sm mt-1">Marketing, local SEO, and growth for service businesses</p>
              </div>
            </div>

            {/* Episodes */}
            <div className="divide-y divide-neutral-100">
              {podcastEpisodes.map((ep, i) => (
                <div key={ep.episode} className="p-5 flex items-start gap-4 hover:bg-neutral-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ep.progress === 100 ? "bg-green-100" : ep.progress > 0 ? "bg-purple-100" : "bg-neutral-100"}`}>
                    {ep.progress === 100
                      ? <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>
                      : <Play className={`w-4 h-4 ${ep.progress > 0 ? "text-purple-600 fill-purple-600" : "text-neutral-400 fill-neutral-400"} ml-0.5`} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-neutral-900 text-sm leading-snug">{ep.title}</p>
                      <span className="text-xs text-neutral-400 flex-shrink-0">{ep.duration}</span>
                    </div>
                    <p className="text-neutral-500 text-xs leading-relaxed mb-2">{ep.desc}</p>
                    {ep.progress > 0 && ep.progress < 100 && (
                      <div className="h-1 bg-neutral-200 rounded-full overflow-hidden w-full max-w-xs">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${ep.progress}%` }} />
                      </div>
                    )}
                    <span className="text-xs text-neutral-400 font-medium">{ep.episode}</span>
                  </div>
                  <a href={ep.link} target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-400 hover:text-primary-600 flex-shrink-0 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Performance Report ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<BarChart3 className="w-5 h-5 text-primary-600" />}
            iconBg="bg-primary-100"
            label="Monthly Report"
            title="Always Know Your ROI"
            desc="A plain-English monthly performance report showing exactly what worked, what didn't, and where we're taking you next month. Full plan only."
            count="Full Plan"
            countColor="bg-primary-50 text-primary-700 border-primary-200"
          />

          <div className="mt-12 max-w-4xl mx-auto">
            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {reportMetrics.map((m) => (
                <div key={m.label} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1">{m.label}</p>
                  <p className="text-3xl font-bold text-neutral-900">{m.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-bold text-green-600">{m.change}</span>
                    <span className="text-xs text-neutral-400">vs last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fake bar chart */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-neutral-900 text-sm">Weekly Reach</p>
                <span className="text-xs text-neutral-400">Last 4 weeks</span>
              </div>
              <div className="flex items-end gap-3 h-32">
                {[55, 70, 45, 88, 62, 95, 78, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-300"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral-400">
                {["Wk 1", "Wk 1", "Wk 2", "Wk 2", "Wk 3", "Wk 3", "Wk 4", "Wk 4"].map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
            </div>

            {/* Top post */}
            <div className="mt-4 bg-primary-50 border border-primary-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-primary-600 fill-primary-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-0.5">Top Performing Post</p>
                <p className="text-neutral-800 text-sm font-medium">"3 signs your roof needs attention RIGHT NOW" — 21.7K views, 4.1% engagement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Email Newsletter ── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Mail className="w-5 h-5 text-primary-600" />}
            iconBg="bg-primary-100"
            label="Email Newsletter"
            title="Stay Top of Mind Every Month"
            desc="A branded, AI-written email newsletter delivered to your subscriber list. Drives repeat business and referrals — fully automated via Resend."
            count="Add-on · $149/mo"
            countColor="bg-neutral-100 text-neutral-600 border-neutral-200"
          />

          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
              {/* Email header */}
              <div className="bg-primary-600 px-8 py-6 text-center">
                <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-2">Oakridge Roofing · Monthly Newsletter</p>
                <h3 className="text-white text-2xl font-bold">Spring Roof Checklist: 5 Things to Do Before June</h3>
              </div>
              {/* Email body */}
              <div className="px-8 py-6 space-y-4 text-sm text-neutral-600 leading-relaxed">
                <p>Hi [First Name],</p>
                <p>Spring is the most important season for your roof. After winter storms and freeze-thaw cycles, small issues become big problems fast — but only if left unchecked.</p>
                <p>Here are the 5 things our team recommends every property owner check before June:</p>
                <ol className="space-y-2 list-none">
                  {[
                    "Inspect flashing around chimneys and vents for separation or rust",
                    "Clear gutters of winter debris — blocked gutters cause soffit rot",
                    "Check for missing or curled shingles after high-wind events",
                    "Look for dark staining or moss, which indicates moisture retention",
                    "Schedule a professional thermal scan if your roof is 8+ years old",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
                <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 text-center">
                  <p className="font-bold text-neutral-900 mb-1">Free Spring Inspection — This Month Only</p>
                  <p className="text-neutral-500 text-xs mb-3">Book before May 31st and we'll waive the inspection fee.</p>
                  <div className="inline-block px-6 py-2.5 bg-accent-400 text-white font-bold rounded-lg text-sm">Book My Free Inspection →</div>
                </div>
              </div>
              <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-400">© 2026 Oakridge Roofing · Powered by BundledContent · <span className="underline cursor-pointer">Unsubscribe</span></span>
                <a href="https://0to1marketing.beehiiv.com/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary-600 font-semibold hover:underline flex-shrink-0 ml-4">
                  <ExternalLink className="w-3 h-3" /> View live sample
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Lead Magnet PDF ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<FileText className="w-5 h-5 text-violet-600" />}
            iconBg="bg-violet-100"
            label="Lead Magnet PDF"
            title="A Free Guide That Captures Emails"
            desc="An AI-written, beautifully designed PDF guide tailored to your niche. Offer it as a free download to grow your email list on autopilot."
            count="Add-on · $149 one-time"
            countColor="bg-violet-50 text-violet-700 border-violet-200"
          />

          <div className="mt-12 max-w-xl mx-auto">
            {/* PDF preview card */}
            <div className="relative">
              {/* Shadow pages behind */}
              <div className="absolute top-2 left-2 right-2 bottom-0 bg-neutral-200 rounded-2xl" />
              <div className="absolute top-1 left-1 right-1 bottom-0 bg-neutral-300 rounded-2xl" />
              <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
                {/* PDF cover */}
                <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-400 px-10 py-12 text-white">
                  <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-4">Oakridge Roofing · Free Guide</p>
                  <h3 className="text-3xl font-bold leading-tight mb-3">The Homeowner's Complete Roof Protection Playbook</h3>
                  <p className="text-primary-100 text-sm leading-relaxed">7 proven strategies to extend your roof's life by 10+ years — and avoid the 3 mistakes that cost homeowners thousands.</p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm">OR</div>
                    <div>
                      <p className="font-bold text-sm">Oakridge Roofing</p>
                      <p className="text-primary-200 text-xs">20+ Years · Licensed & Insured</p>
                    </div>
                  </div>
                </div>
                {/* Table of contents preview */}
                <div className="px-8 py-6">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-4">Inside This Guide</p>
                  <div className="space-y-2">
                    {[
                      "The Annual Inspection Checklist Pros Use",
                      "5 Warning Signs 90% of Homeowners Miss",
                      "How to Extend Your Roof's Life by a Decade",
                      "When to Repair vs. When to Replace",
                      "How to Vet a Roofing Contractor (Red Flags)",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-neutral-600">
                        <span className="text-xs font-bold text-primary-500 w-4 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <a href="https://f.hubspotusercontent00.net/hubfs/53/Learning%20Path%20Checklists_HubSpot%20Academy/DigitalMarketingStrategy_LearningPathChecklist_HubSpotAcademy.pdf"
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white font-bold rounded-xl text-sm hover:bg-primary-700 transition-colors">
                      <Download className="w-4 h-4" /> Download Sample PDF
                    </a>
                    <a href="https://blog.beehiiv.com/p/2025-state-of-email-newsletters-by-beehiiv"
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 text-neutral-600 font-semibold rounded-xl text-sm hover:bg-neutral-50 transition-colors">
                      <ExternalLink className="w-4 h-4" /> Preview
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to See This for Your Business?</h2>
          <p className="text-primary-100 text-lg mb-8">Enter your website and we'll generate real sample content for your brand — free, in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent-400 hover:bg-accent-500 text-white font-bold rounded-xl transition-colors shadow-lg text-lg">
              Try My Free Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white font-bold rounded-xl hover:bg-white/25 transition-colors text-lg">
              View Plans →
            </Link>
          </div>
          <p className="text-primary-200 text-xs mt-4">No credit card. No obligation. Real AI-generated output.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ─── Reel card with inline playback ────────────────────── */

function ReelCard({ reel, reelImage, fallbackGradient, generating }: {
  reel: { label: string; caption: string; duration: string; imageKey: string; views: string };
  reelImage: string;
  fallbackGradient: string;
  generating?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Phone frame */}
      <div
        className="relative mx-auto w-full max-w-[180px] cursor-pointer group"
        onClick={() => !generating && setPlaying(!playing)}
      >
        <div className="rounded-3xl border-4 border-neutral-900 overflow-hidden shadow-2xl bg-neutral-900 aspect-[9/16] relative">
          {/* Loading overlay — translucent so thumbnail still visible */}
          {generating && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2">
              <div className="absolute inset-0 skeleton opacity-30" />
              <Loader2 className="w-6 h-6 animate-spin text-white relative z-10" />
              <p className="text-white text-xs font-medium relative z-10">Generating…</p>
            </div>
          )}

          {reelImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={reelImage}
              alt={reel.label}
              className={`absolute inset-0 w-full h-full object-cover reel-animate ${playing ? 'reel-playing' : 'reel-paused'}`}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-b ${fallbackGradient} opacity-90`} />
          )}

          {!playing && !generating && (
            <div className="absolute inset-0 bg-black/20" />
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            {!playing && !generating && (
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            )}
          </div>

          {playing && !generating && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}

          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {reel.duration}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            <Eye className="w-3 h-3" /> {reel.views}
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-neutral-900 rounded-b-xl" />
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{reel.label}</span>
        {generating ? (
          <div className="mt-1 space-y-1.5 flex flex-col items-center">
            <div className="h-2.5 skeleton rounded w-4/5" />
            <div className="h-2.5 skeleton rounded w-3/5" />
          </div>
        ) : (
          <p className="text-xs text-neutral-600 mt-1 leading-relaxed line-clamp-3">{reel.caption}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Reusable section header ─────────────────────────── */

function SectionHeader({
  icon, iconBg, label, title, desc, count, countColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  title: string;
  desc: string;
  count: string;
  countColor: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className={`inline-flex items-center gap-2 w-10 h-10 ${iconBg} rounded-xl justify-center mb-4`}>
        {icon}
      </div>
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-sm font-bold text-neutral-500 uppercase tracking-wide">{label}</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${countColor}`}>{count}</span>
      </div>
      <h2 className="text-3xl font-bold text-neutral-900 mb-4">{title}</h2>
      <p className="text-neutral-500 text-lg leading-relaxed">{desc}</p>
    </div>
  );
}
