import Link from "next/link";
import {
  Zap,
  Check,
  Globe,
  Share2,
  Mic,
  Video,
  BarChart3,
  Star,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const deliverables = [
  {
    icon: <Globe className="w-7 h-7 text-primary-600" />,
    iconBg: "bg-primary-50",
    number: "5",
    unit: "Landing Pages",
    label: "on signup, +1 every month",
    headline: "Your Website Grows With You",
    desc: "We build 5 conversion-ready landing pages the moment you sign up — then add one more every single month. Your digital footprint compounds automatically, no brief required.",
    accent: "border-primary-200",
    tag: "Included at signup",
    tagColor: "bg-primary-50 text-primary-700",
  },
  {
    icon: <Share2 className="w-7 h-7 text-indigo-600" />,
    iconBg: "bg-indigo-50",
    number: "150",
    unit: "Social Posts",
    label: "per month across 5 priority channels",
    headline: "Always-On Social Presence",
    desc: "150 branded, scheduled posts every month across your 5 highest-performing channels. Deep coverage where it counts — not a thin spread across every platform.",
    accent: "border-indigo-200",
    tag: "5 channels",
    tagColor: "bg-indigo-50 text-indigo-700",
  },
  {
    icon: <Mic className="w-7 h-7 text-purple-600" />,
    iconBg: "bg-purple-50",
    number: "26",
    unit: "Podcast Episodes",
    label: "bi-weekly — 26 per year",
    headline: "Your Voice. Your Authority.",
    desc: "A bi-weekly AI-cloned voice podcast keeps your brand front of mind year-round. 26 episodes per year — quality over quantity, sustainable for the long haul.",
    accent: "border-purple-200",
    tag: "Bi-weekly cadence",
    tagColor: "bg-purple-50 text-purple-700",
  },
  {
    icon: <Video className="w-7 h-7 text-rose-600" />,
    iconBg: "bg-rose-50",
    number: "4",
    unit: "HeyGen Videos",
    label: "per month — AI presenter videos",
    headline: "Professional Video Without a Camera",
    desc: "4 polished AI presenter videos every month using HeyGen. Rotate them across social, email, and your website — fresh video content that actually gets watched.",
    accent: "border-rose-200",
    tag: "4/month",
    tagColor: "bg-rose-50 text-rose-700",
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-teal-600" />,
    iconBg: "bg-teal-50",
    number: "1",
    unit: "Performance Report",
    label: "every month — your marketing scorecard",
    headline: "Know Exactly What's Working",
    desc: "A clear, plain-English monthly report on what performed, what didn't, and where we're heading. PulseCommand is a service, not a vending machine — you'll always know your ROI.",
    accent: "border-teal-200",
    tag: "Monthly",
    tagColor: "bg-teal-50 text-teal-700",
  },
];

const testimonials = [
  {
    quote: "PulseCommand replaced an entire in-house marketing team. The monthly report alone changed how we make decisions.",
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

const included = [
  "5 landing pages on signup, +1 every month",
  "150 social posts/month across 5 priority channels",
  "Bi-weekly AI voice podcast (26 episodes/year)",
  "4 HeyGen AI presenter videos per month",
  "Monthly performance report & strategy review",
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
              One plan. Everything included. $745/mo.
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 tracking-tight mb-8">
              A Full Marketing Team,{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                For $745 a Month
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Landing pages. Social content. Podcast. Videos. Monthly reporting. PulseCommand delivers a complete done-for-you marketing operation — powered by AI, built for your business.
            </p>

            {/* Quick deliverables strip */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["5 Landing Pages", "150 Posts/mo", "26 Podcast Episodes/yr", "4 Videos/mo", "Monthly Report"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700 font-medium shadow-sm">
                  <Check className="w-3.5 h-3.5 text-green-500" /> {item}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Get Started — $745/mo
              </Link>
              <Link
                href="/#what-you-get"
                className="px-8 py-4 bg-white text-neutral-700 border border-neutral-200 font-semibold rounded-lg hover:bg-neutral-50 transition-all shadow-sm hover:shadow-md"
              >
                See What&apos;s Included
              </Link>
            </div>
            <p className="text-sm text-neutral-400 mt-4">No lock-in contracts. Cancel anytime.</p>
          </div>

          {/* Dashboard preview */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-2xl blur opacity-20" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80"
                alt="PulseCommand Dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* What You Get — 5 Deliverables */}
      <section id="what-you-get" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Everything Included at $745/mo</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Five high-impact deliverables, delivered every month without you lifting a finger.
            </p>
          </div>

          <div className="space-y-8">
            {deliverables.map((d, i) => (
              <div
                key={d.unit}
                className={`bg-white rounded-2xl border-2 ${d.accent} shadow-sm overflow-hidden`}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  {/* Content */}
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
                  {/* Icon panel */}
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

      {/* Pricing — Single Card */}
      <section id="pricing" className="py-24 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">One Plan. Everything Included.</h2>
            <p className="text-lg text-neutral-600">
              No tiers. No upsells. No wondering what&apos;s included. Just results.
            </p>
          </div>

          <div className="bg-neutral-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-xl">PulseCommand</p>
                  <p className="text-neutral-400 text-sm">Complete AI Marketing Service</p>
                </div>
              </div>

              <div className="flex items-end gap-2 mb-2">
                <span className="text-6xl font-bold">$745</span>
                <span className="text-neutral-400 text-lg pb-2">/month</span>
              </div>
              <p className="text-neutral-400 text-sm mb-8">No lock-in. Cancel anytime.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-neutral-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/sign-up"
                className="block w-full py-4 bg-white text-neutral-900 font-bold rounded-xl text-center hover:bg-primary-50 transition-colors shadow-lg text-lg"
              >
                Get Started Today <ArrowRight className="inline w-5 h-5 ml-1" />
              </Link>
              <p className="text-center text-neutral-500 text-xs mt-4">Setup begins within 24 hours of signup.</p>
            </div>
          </div>

          {/* Value comparison */}
          <div className="mt-10 bg-white rounded-2xl border border-neutral-200 p-8">
            <p className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-6">What this replaces</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { role: "Social Media Manager", cost: "$4,500/mo" },
                { role: "Content Writer", cost: "$3,000/mo" },
                { role: "Podcast Producer", cost: "$2,000/mo" },
                { role: "Video Editor", cost: "$2,500/mo" },
                { role: "Web Designer", cost: "$3,500/mo" },
                { role: "Marketing Analyst", cost: "$4,000/mo" },
              ].map(({ role, cost }) => (
                <div key={role} className="text-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-1">{role}</p>
                  <p className="text-sm font-bold text-neutral-400 line-through">{cost}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-neutral-500 text-sm">vs.</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">$745/mo with PulseCommand</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Trusted by Growing Businesses</h2>
            <p className="text-lg text-neutral-600">See what our customers are saying.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
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
      <section className="py-20 bg-gradient-to-r from-primary-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Command Your Growth?</h2>
          <p className="text-primary-100 text-lg mb-3">
            5 landing pages. 150 posts. 26 podcast episodes. 4 videos. Monthly reporting.
          </p>
          <p className="text-primary-200 text-sm mb-8">All for $745/month. Setup within 24 hours.</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-lg hover:bg-primary-50 transition-colors shadow-lg text-lg"
          >
            Get Started Today <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-primary-200 text-xs mt-4">No contracts. Cancel anytime.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
