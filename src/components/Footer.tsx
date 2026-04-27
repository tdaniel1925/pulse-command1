import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">PulseCommand</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              A complete done-for-you AI marketing service. Landing pages, social content, podcast, videos, and monthly reporting — all for $745/mo.
            </p>
          </div>

          {/* What's Included */}
          <div>
            <h4 className="font-bold text-white mb-6">What&apos;s Included</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/#what-you-get" className="hover:text-primary-400 transition-colors">Landing Pages</Link></li>
              <li><Link href="/#what-you-get" className="hover:text-primary-400 transition-colors">Social Content</Link></li>
              <li><Link href="/#what-you-get" className="hover:text-primary-400 transition-colors">AI Voice Podcast</Link></li>
              <li><Link href="/#what-you-get" className="hover:text-primary-400 transition-colors">HeyGen Videos</Link></li>
              <li><Link href="/#what-you-get" className="hover:text-primary-400 transition-colors">Monthly Report</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="#" className="hover:text-primary-400 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white mb-6">Stay Updated</h4>
            <p className="text-sm text-neutral-400 mb-4">
              AI marketing tips and PulseCommand updates, straight to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-neutral-800 border border-neutral-700 text-white px-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-primary-500"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} PulseCommand. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm text-neutral-500">
            <Link href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-neutral-300 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
