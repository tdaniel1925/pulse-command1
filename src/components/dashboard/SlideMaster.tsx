'use client';

import type { PresentationTemplate } from '@/lib/presentation-templates';

interface Props {
  template: PresentationTemplate;
  slideNumber: number;
  totalSlides: number;
  businessName: string;
  logoUrl?: string | null;
  isFullscreen: boolean;
}

export function SlideMaster({ template, slideNumber, totalSlides, businessName, logoUrl, isFullscreen }: Props) {
  const { tokens } = template;
  const topPos = isFullscreen ? 'top-6' : 'top-4';
  const leftPos = isFullscreen ? 'left-8' : 'left-6';
  const rightPos = isFullscreen ? 'right-8' : 'right-6';
  const bottomPos = isFullscreen ? 'bottom-6' : 'bottom-4';

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* TOP RULE */}
      {tokens.showFooterRule && (
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: '2px', background: tokens.accent }}
        />
      )}

      {/* TOP-LEFT: Logo / business name */}
      {tokens.showLogo && (
        <div className={`absolute ${topPos} ${leftPos}`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={businessName}
              style={{ height: '32px', objectFit: 'contain' }}
            />
          ) : (
            <span
              className="text-xs font-bold"
              style={{ color: tokens.accent }}
            >
              {businessName}
            </span>
          )}
        </div>
      )}

      {/* BOTTOM RULE */}
      {tokens.showFooterRule && (
        <div
          className={`absolute ${bottomPos === 'bottom-4' ? 'bottom-10' : 'bottom-12'} ${leftPos} ${rightPos}`}
          style={{ height: '1px', background: tokens.border, opacity: 0.3 }}
        />
      )}

      {/* BOTTOM-LEFT: Footer text */}
      {tokens.footerText && (
        <div className={`absolute ${bottomPos} ${leftPos}`}>
          <span
            className="uppercase tracking-widest"
            style={{
              fontSize: '9px',
              color: tokens.textSecondary,
              opacity: 0.6,
            }}
          >
            {tokens.footerText}
          </span>
        </div>
      )}

      {/* BOTTOM-RIGHT: Page number */}
      {tokens.showPageNumber && (
        <div className={`absolute ${bottomPos} ${rightPos}`}>
          <span
            className="text-xs"
            style={{ color: tokens.textSecondary }}
          >
            {slideNumber} / {totalSlides}
          </span>
        </div>
      )}
    </div>
  );
}
