import Link from "next/link";
import {
  Check, Share2, Mic, Video, BarChart3, Star, ChevronRight,
  ArrowRight, Smartphone, Mail, MapPin, FileText, Shield, Zap, Plus
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const deliverables = [
  {
    icon: <Share2 className="w-7 h-7 text-primary-600" />,
    iconBg: "bg-primary-50",
    number: "150",
    unit: "Social Posts",
    label: "per month · Lite gets 30",
    headline: "Always-On Social Presence",
    desc: "Branded, platform-specific posts every month across your highest-performing channels. Instagram, Facebook, LinkedIn, X, and Google Business — each post written for that platform's audience and algorithm.",
    accent: "border-primary-200",
    tag: "5 platforms",
    tagColor: "bg-primary-50 text-primary-700",
  },
  {
    icon: <Smartphone className="w-7 h-7 text-accent-500" />,
    iconBg: "bg-accent-50",
    number: "4",
    unit: "Short Reels / TikToks",
    label: "per month · Lite gets 1 · vertical 9:16 format",
    headline: "Phone-First Video That Gets Watched",
    desc: "15–60 second vertical AI presenter videos built for Instagram Reels, TikTok, and YouTube Shorts. Each clip has a punchy CTA caption with your link — ready to copy-paste and post. No camera. No editing. No studio.",
    accent: "border-accent-200",
    tag: "Reels · TikTok · Shorts",
    tagColor: "bg-accent-50 text-accent-700",
  },
  {
    icon: <Mic className="w-7 h-7 text-purple-600" />,
    iconBg: "bg-purple-50",
    number: "26",
    unit: "Podcast Episodes",
    label: "bi-weekly — 26 per year · Lite gets 12",
    headline: "Your Voice. Your Authority.",
    desc: "A bi-weekly AI-cloned voice podcast keeps your brand front of mind year-round. Each episode is scripted for your brand, rendered with ElevenLabs voice AI, and delivered as a ready-to-publish MP3.",
    accent: "border-purple-200",
    tag: "Bi-weekly cadence",
    tagColor: "bg-purple-50 text-purple-700",
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-primary-600" />,
    iconBg: "bg-primary-50",
    number: "1",
    unit: "Performance Report",
    label: "every month — Full plan only",
    headline: "Know Exactly What's Working",
    desc: "A clear, plain-English monthly report on what performed, what didn't, and where we're heading. You'll always know your ROI — BundledContent is a service, not a vending machine.",
    accent: "border-primary-200",
    tag: "Monthly · Full plan",
    tagColor: "bg-primary-50 text-primary-700",
  },
];

const addons = [
  {
    icon: <Smartphone className="w-5 h-5 text-accent-500" />,
    name: "Extra Short Video",
    desc: "One additional 15–60s vertical Reels/TikTok clip with CTA caption, beyond your plan.",
    price: "$49",
    billing: "one-time",
    color: "border-accent-200 bg-accent-50",
    iconBg: "bg-accent-100",
  },
  {
    icon: <Share2 className="w-5 h-5 text-primary-500" />,
    name: "Extra 10 Social Posts",
    desc: "10 additional branded posts for any platform, on top of your monthly allotment.",
    price: "$29",
    billing: "one-time",
    color: "border-primary-200 bg-primary-50",
    iconBg: "bg-primary-100",
  },
  {
    icon: <Mail className="w-5 h-5 text-primary-500" />,
    name: "Monthly Email Newsletter",
    desc: "AI-written branded newsletter sent to your subscriber list via Resend every month.",
    price: "$149",
    billing: "per month",
    color: "border-primary-200 bg-primary-50",
    iconBg: "bg-primary-100",
  },
  {
    icon: <MapPin className="w-5 h-5 text-green-500" />,
    name: "Google Business Posts",
    desc: "Weekly AI-written posts pushed directly to your Google Business Profile to boost local SEO.",
    price: "$49",
    billing: "per month",
    color: "border-green-200 bg-green-50",
    iconBg: "bg-green-100",
  },
  {
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    name: "AI Landing Page",
    desc: "A high-converting lead capture page built by AI, hosted on bundledcontent.com for your brand.",
    price: "$199",
    billing: "one-time",
    color: "border-amber-200 bg-amber-50",
    iconBg: "bg-amber-100",
  },
  {
    icon: <FileText className="w-5 h-5 text-violet-500" />,
    name: "Lead Magnet PDF",
    desc: "AI-written PDF guide or checklist tailored to your niche — perfect for email list building.",
    price: "$149",
    billing: "one-time",
    color: "border-violet-200 bg-violet-50",
    iconBg: "bg-violet-100",
  },
  {
    icon: <Shield className="w-5 h-5 text-neutral-500" />,
    name: "Reputation Management",
    desc: "Monitor Google & Yelp reviews. AI drafts replies for your approval — protect your brand 24/7.",
    price: "$99",
    billing: "per month",
    color: "border-neutral-200 bg-neutral-50",
    iconBg: "bg-neutral-100",
  },
  {
    icon: <ChevronRight className="w-5 h-5 text-primary-500" />,
    name: "Rush Delivery",
    desc: "Need content fast? Get everything delivered the next business day instead of standard turnaround.",
    price: "$99",
    billing: "one-time",
    color: "border-primary-200 bg-primary-50",
    iconBg: "bg-primary-100",
  },
];

const testimonials = [
  {
    quote: "BundledContent replaced an entire in-house marketing team. The monthly report alone changed how we make decisions.",
    name: "Sarah M.",
    role: "Marketing Director",
    rating: 5,
  },
  {
    quote: "We went from zero online presence to 150 posts a month and 4 videos — all on autopilot. Unreal value.",
    name: "James T.",
    role: "Business Owner",
    rating: 5,
  },
  {
    quote: "The bi-weekly podcast has become our #1 lead gen channel. I haven't recorded a single episode myself.",
    name: "Priya K.",
    role: "Brand Strategist",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              Agency-Quality Content. DIY Pricing. Zero Overhead.
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 tracking-tight mb-8">
              Agency Service.{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-400">
                DIY Prices.
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-3 max-w-3xl mx-auto leading-relaxed">
              BundledContent gives you a complete done-for-you content operation — social posts, short videos, podcast, newsletter, and more — built by broadcast and brand veterans, powered by AI, and priced for the businesses that need it most.
            </p>
            <p className="text-base text-primary-600 font-semibold mb-6 max-w-xl mx-auto">
              Now you can. Starting at $99/mo.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Social Posts", "Short Reels/TikToks", "AI Podcast", "Email Newsletter", "Lead Magnet PDF", "Monthly Report"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700 font-medium shadow-sm">
                  <Check className="w-3.5 h-3.5 text-green-500" /> {item}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo"
                className="px-8 py-4 bg-accent-400 text-white font-bold rounded-lg hover:bg-accent-500 transition-all shadow-lg hover:shadow-xl text-lg">
                Try Free Demo →
              </Link>
              <Link href="#pricing"
                className="px-8 py-4 bg-white text-neutral-700 border border-neutral-200 font-semibold rounded-lg hover:bg-neutral-50 transition-all shadow-sm hover:shadow-md">
                See Plans →
              </Link>
            </div>
            <p className="text-sm text-neutral-400 mt-4">No lock-in contracts. Cancel anytime. Setup in 24 hours.</p>
          </div>

          {/* Dashboard preview */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl blur opacity-20" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80"
                alt="BundledContent Dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section id="what-you-get" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">What an Agency Delivers. At a Fraction of the Cost.</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Four core deliverables included in every plan — the kind of output most agencies charge $10K+/mo for. Plus 8 optional add-ons to build exactly what your business needs.
            </p>
          </div>

          <div className="space-y-8">
            {deliverables.map((d, i) => (
              <div key={d.unit} className={`bg-white rounded-2xl border-2 ${d.accent} shadow-sm overflow-hidden`}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full w-fit mb-5 ${d.tagColor}`}>
                      {d.tag}
                    </span>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-5xl font-bold text-neutral-900">{d.number}</span>
                      <span className="text-2xl font-bold text-neutral-700 pb-1">{d.unit}</span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-4">{d.label}</p>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">{d.headline}</h3>
                    <p className="text-neutral-600 leading-relaxed">{d.desc}</p>
                  </div>
                  <div className={`${d.iconBg} flex items-center justify-center p-12 lg:p-16`}>
                    <div className="text-center">
                      <div className={`w-24 h-24 ${d.iconBg} border-2 ${d.accent} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                        <div className="scale-150">{d.icon}</div>
                      </div>
                      <p className="text-4xl font-bold text-neutral-800">{d.number}</p>
                      <p className="text-neutral-600 font-medium">{d.unit}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section id="addons" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Plus className="w-4 h-4" /> Optional Add-ons
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Build Your Perfect Marketing Stack</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Every add-on is fully automated. Add what you need, skip what you don&apos;t. Available to any plan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {addons.map((addon) => (
              <div key={addon.name} className={`bg-white rounded-2xl border-2 ${addon.color.split(" ")[0]} p-5 shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-10 h-10 ${addon.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  {addon.icon}
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-bold text-neutral-900 text-sm leading-tight">{addon.name}</p>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-neutral-900 text-sm">{addon.price}</p>
                    <p className="text-xs text-neutral-400">{addon.billing}</p>
                  </div>
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">{addon.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-400 text-sm mt-8">
            Add-ons are managed from your dashboard after signing up. All fully automated.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Pick Your Plan</h2>
            <p className="text-lg text-neutral-600">
              Same AI onboarding. Same quality. Upgrade or add-on anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Lite */}
            <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-sm">
              <div className="mb-6">
                <p className="font-bold text-xl text-neutral-900">BundledContent Lite</p>
                <p className="text-neutral-500 text-sm mt-1">Perfect to get started</p>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-bold text-neutral-900">$99</span>
                <span className="text-neutral-400 text-lg pb-1">/month</span>
              </div>
              <p className="text-neutral-400 text-xs mb-6">14-day free trial · No credit card needed</p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: <Share2 className="w-4 h-4 text-primary-500" />,    text: "30 social posts/month" },
                  { icon: <Smartphone className="w-4 h-4 text-accent-400" />,  text: "1 short Reel/TikTok per month" },
                  { icon: <Mic className="w-4 h-4 text-purple-500" />,       text: "1 podcast episode/month" },
                  { icon: <Check className="w-4 h-4 text-green-500" />,      text: "3 platforms covered" },
                  { icon: <Check className="w-4 h-4 text-green-500" />,      text: "All 8 add-ons available" },
                  { icon: <Check className="w-4 h-4 text-green-500" />,      text: "AI onboarding included" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-neutral-100">{icon}</div>
                    <span className="text-neutral-600 text-sm">{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/sign-up?plan=lite"
                className="block w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl text-center hover:bg-neutral-800 transition-colors text-base">
                Get Started — $99/mo <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
              <p className="text-center text-neutral-400 text-xs mt-3">Setup begins within 24 hours.</p>
            </div>

            {/* Full */}
            <div className="bg-neutral-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border-2 border-primary-500">
              <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative">
                <div className="mb-6">
                  <p className="font-bold text-xl">BundledContent Full</p>
                  <p className="text-neutral-400 text-sm mt-1">Complete AI marketing machine</p>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-bold">$745</span>
                  <span className="text-neutral-400 text-lg pb-1">/month</span>
                </div>
                <p className="text-neutral-500 text-xs mb-6">14-day free trial · No credit card needed</p>
                <div className="space-y-3 mb-8">
                  {[
                    { icon: <Share2 className="w-4 h-4 text-primary-300" />,    text: "150 social posts/month · 5 channels" },
                    { icon: <Smartphone className="w-4 h-4 text-accent-300" />,  text: "4 short Reels/TikToks per month" },
                    { icon: <Mic className="w-4 h-4 text-purple-400" />,       text: "Bi-weekly podcast · 26 eps/year" },
                    { icon: <BarChart3 className="w-4 h-4 text-primary-300" />,   text: "Monthly performance report" },
                    { icon: <Check className="w-4 h-4 text-green-400" />,      text: "All 5 platforms covered" },
                    { icon: <Check className="w-4 h-4 text-green-400" />,      text: "All 8 add-ons available" },
                    { icon: <Check className="w-4 h-4 text-green-400" />,      text: "Priority support" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                      <span className="text-neutral-300 text-sm">{text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/sign-up?plan=full"
                  className="block w-full py-3.5 bg-white text-neutral-900 font-bold rounded-xl text-center hover:bg-primary-50 transition-colors text-base">
                  Get Started — $745/mo <ArrowRight className="inline w-4 h-4 ml-1" />
                </Link>
                <p className="text-center text-neutral-500 text-xs mt-3">Setup begins within 24 hours.</p>
              </div>
            </div>
          </div>

          {/* Value comparison */}
          <div className="mt-10 bg-neutral-50 rounded-2xl border border-neutral-200 p-8">
            <p className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-6">What a real agency would charge you</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { role: "Social Media Manager", cost: "$4,500/mo" },
                { role: "Content Writer",        cost: "$3,000/mo" },
                { role: "Podcast Producer",      cost: "$2,000/mo" },
                { role: "Video Editor",          cost: "$2,500/mo" },
                { role: "Web Designer",          cost: "$3,500/mo" },
                { role: "Marketing Analyst",     cost: "$4,000/mo" },
              ].map(({ role, cost }) => (
                <div key={role} className="text-center p-4 bg-white rounded-xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-1">{role}</p>
                  <p className="text-sm font-bold text-neutral-400 line-through">{cost}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-neutral-500 text-sm">vs.</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">$745/mo with BundledContent Full</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Real Businesses. Real Results.</h2>
            <p className="text-lg text-neutral-600">These businesses stopped paying agency prices — and got better output.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-700 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-neutral-900">{t.name}</p>
                  <p className="text-sm text-neutral-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Stop Paying Agency Prices.<br />Start Getting Agency Results.</h2>
          <p className="text-primary-100 text-lg mb-3">
            Built by broadcast and brand veterans. Powered by AI. Priced for the businesses that need it most.
          </p>
          <p className="text-primary-200 text-sm mb-8">Lite at $99/mo · Full at $745/mo · Add-ons available · No contracts.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent-400 text-white font-bold rounded-lg hover:bg-accent-500 transition-colors shadow-lg text-lg">
              Try Free Demo <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white font-bold rounded-lg hover:bg-white/25 transition-colors text-lg">
              See Plans →
            </Link>
          </div>
          <p className="text-primary-200 text-xs mt-4">No contracts. Cancel anytime. Setup within 24 hours.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
