'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium text-sm transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          Copy Link
        </>
      )}
    </button>
  );
}
