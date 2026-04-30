"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Zap, BarChart3, Users, Sparkles, Star, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const pricingTiers = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for testing",
      features: [
        "20 posts/month",
        "Basic analytics",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Essential",
      price: "$99",
      period: "/month",
      description: "For growing brands",
      features: [
        "50 posts/month",
        "2 videos/month",
        "Advanced analytics",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$149",
      period: "/month",
      description: "Most popular",
      features: [
        "100 posts/month",
        "5 videos/month",
        "✓ Whitepaper",
        "✓ Articles (5)",
        "✓ Tweet Threads (20)",
        "✓ Infographics (8)",
        "✓ Case Studies (4)",
        "Dedicated manager",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Agency",
      price: "$399",
      period: "/month",
      description: "For teams & agencies",
      features: [
        "Unlimited posts/videos",
        "All content types",
        "Email sequences",
        "Podcast generation",
        "Team collaboration",
        "Custom integrations",
        "White-label options",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "How does the VAPI interview work?",
      answer: "You schedule a 15-minute call with our AI agent. It asks strategic questions about your business, target market, competitors, and goals. We analyze the transcript and generate a complete marketing strategy and monthly content suite.",
    },
    {
      question: "Can I edit the generated content?",
      answer: "Yes! The monthly content dashboard lets you review everything before approval. Once approved, content is published to all your connected platforms automatically.",
    },
    {
      question: "Which platforms does PulseCommand support?",
      answer: "We publish to Twitter/X, LinkedIn, Instagram, Facebook, TikTok, and email. All through Ayrshare integration. You can connect any platform we support.",
    },
    {
      question: "What if I don't have a strategy yet?",
      answer: "That's exactly what we solve for. The VAPI interview guides you through strategy creation. Our AI builds it based on your answers. No marketing knowledge needed.",
    },
    {
      question: "Can multiple team members use one account?",
      answer: "The Agency plan ($399) includes team collaboration features. Email us for details on custom team setups.",
    },
    {
      question: "How much does this actually save?",
      answer: "A professional marketing agency costs $5-10K/month. A freelancer costs $2-5K. PulseCommand is $49-399/month. You get 3 months of content in 15 minutes.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            BundledContent
          </div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-6 py-2 text-neutral-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Your AI Marketing Team
              <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                For Less Than One Freelancer
              </span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              One 15-minute interview. Complete monthly marketing plan with 150+ pieces of content. Posts, videos, podcasts, whitepapers, emails—all aligned to your brand strategy.
            </p>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold text-lg flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border border-neutral-700 text-white rounded-lg hover:border-neutral-500 transition-colors font-bold text-lg">
              Watch Demo
            </button>
          </div>

          <div className="pt-8 text-sm text-neutral-400">
            ✓ No credit card required • ✓ 7-day free trial • ✓ Full platform access
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/50">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Content Creation is Broken</h2>
            <p className="text-xl text-neutral-400">
              Small teams spend $5-10K/month on marketing. But they still get:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 space-y-3">
              <div className="text-3xl">❌</div>
              <h3 className="font-bold text-lg">Scattered Content</h3>
              <p className="text-neutral-400">Posts, emails, videos from different people, different tones, inconsistent messaging</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 space-y-3">
              <div className="text-3xl">❌</div>
              <h3 className="font-bold text-lg">Expensive Freelancers</h3>
              <p className="text-neutral-400">$2-5K/month per person. Takes weeks to onboard. High turnover.</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 space-y-3">
              <div className="text-3xl">❌</div>
              <h3 className="font-bold text-lg">No Strategy</h3>
              <p className="text-neutral-400">Content creation becomes reactive. No alignment to business goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">One Interview → Everything</h2>
            <p className="text-xl text-neutral-400">
              Replace your entire marketing process with AI.
            </p>
          </div>

          <div className="space-y-12">
            {/* Brand Strategy */}
            <div className="grid md:grid-cols-2 gap-12 items-center py-8 border-b border-neutral-800">
              <div>
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-3xl font-bold mb-4">Brand Strategy Plan</h3>
                <p className="text-neutral-400 text-lg mb-6">One 15-minute phone call with our AI. We analyze your business, audience, and market to create a complete marketing strategy document.</p>
                <ul className="space-y-2">
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Business overview & UVP extraction</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Target audience deep-dive</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Content pillars & themes</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Channel strategy & tone framework</span>
                  </li>
                </ul>
              </div>
              <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center border border-primary-500/30">
                <div className="text-6xl">🎯</div>
              </div>
            </div>

            {/* Monthly Content */}
            <div className="grid md:grid-cols-2 gap-12 items-center py-8 border-b border-neutral-800 md:flex-row-reverse">
              <div className="md:order-2 aspect-square bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center border border-primary-500/30">
                <div className="text-6xl">📦</div>
              </div>
              <div className="md:order-1">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-3xl font-bold mb-4">Monthly Content Suite</h3>
                <p className="text-neutral-400 text-lg mb-6">3 months of content generated in 15 minutes. Everything aligned to your strategy.</p>
                <ul className="space-y-2">
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">8-10 page professional whitepaper</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">5 LinkedIn articles (1000-1500 words each)</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">20 tweet threads (5-10 tweets each)</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">8 infographic data visualization prompts</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">4 case studies + 3 email sequences + 2 podcasts</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Auto-Publishing */}
            <div className="grid md:grid-cols-2 gap-12 items-center py-8 border-b border-neutral-800">
              <div>
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-3xl font-bold mb-4">Auto-Publishing</h3>
                <p className="text-neutral-400 text-lg mb-6">One-click approval. Content publishes automatically to all your connected social platforms.</p>
                <ul className="space-y-2">
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Multi-platform scheduling</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Twitter/X thread publishing</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">LinkedIn article posting</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Email sequence automation</span>
                  </li>
                </ul>
              </div>
              <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center border border-primary-500/30">
                <div className="text-6xl">⚡</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why PulseCommand */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/50">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Why PulseCommand Wins</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 p-6 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <div className="flex gap-3">
                <Sparkles className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">All-in-One Platform</h3>
                  <p className="text-sm text-neutral-400">No integrating 5 different tools. Strategy, generation, approval, and publishing in one place.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-6 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <div className="flex gap-3">
                <Zap className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Brand Strategy First</h3>
                  <p className="text-sm text-neutral-400">Everything aligns to your strategy. No more random posts. Every piece serves your goals.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-6 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <div className="flex gap-3">
                <BarChart3 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Performance Tracking</h3>
                  <p className="text-sm text-neutral-400">See which content types drive engagement. Make data-driven decisions.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-6 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <div className="flex gap-3">
                <Users className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Built for Teams</h3>
                  <p className="text-sm text-neutral-400">Collaborate on strategy, review content, and publish together.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-neutral-400">
              Start free. Scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 space-y-6 transition-all ${
                  tier.highlighted
                    ? "bg-gradient-to-br from-primary-600 to-primary-700 ring-2 ring-primary-400 scale-105"
                    : "bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {tier.highlighted && (
                  <div className="inline-block px-3 py-1 bg-primary-500/30 text-primary-100 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className={`text-sm ${tier.highlighted ? "text-primary-100" : "text-neutral-400"}`}>
                    {tier.description}
                  </p>
                </div>
                <div>
                  <div className="text-4xl font-bold">{tier.price}</div>
                  <div className={`text-sm ${tier.highlighted ? "text-primary-100" : "text-neutral-400"}`}>
                    {tier.period}
                  </div>
                </div>
                <button
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    tier.highlighted
                      ? "bg-white text-primary-600 hover:bg-primary-50"
                      : "bg-neutral-800 text-white hover:bg-neutral-700"
                  }`}
                >
                  {tier.cta}
                </button>
                <ul className="space-y-3">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex gap-2 items-start text-sm">
                      <Star className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/50">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-neutral-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="text-lg font-bold text-left">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-6 text-neutral-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-primary-600/20 to-primary-500/20 border border-primary-500/30 rounded-2xl p-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">
              Stop Paying Agency Prices
            </h2>
            <p className="text-xl text-neutral-300">
              Start free today. No credit card required. Full platform access for 7 days.
            </p>
          </div>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold text-lg"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              BundledContent
            </div>
            <div className="flex gap-6 text-neutral-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
            © 2026 BundledContent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
