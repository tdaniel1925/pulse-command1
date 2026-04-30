'use client';

import Image from 'next/image';
import type { PresentationTemplate } from '@/lib/presentation-templates';
import { WaterfallChart, parseWaterfallFromBullets } from './charts/WaterfallChart';
import { TimelineChart, parseTimelineFromBullets } from './charts/TimelineChart';
import { ComparisonTable, parseComparisonFromBullets } from './charts/ComparisonTable';
import { ProcessFlow, parseProcessFromBullets } from './charts/ProcessFlow';

export type SlideLayout =
  | 'title'
  | 'bullets'
  | 'image_left'
  | 'image_right'
  | 'quote'
  | 'stats'
  | 'two_col'
  | 'section'
  | 'nano_statement'
  | 'nano_number'
  | 'nano_question'
  | 'nano_quote'
  | 'exec_summary'
  | 'waterfall'
  | 'timeline'
  | 'comparison'
  | 'process'
  | 'big_stat';

export interface Slide {
  index: number;
  layout: SlideLayout;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  bullets: string[] | null;
  image_url: string | null;
  image_prompt: string | null;
  speaker_notes: string | null;
  accent_color: string;
}

interface SlideRendererProps {
  slide: Slide;
  isFullscreen: boolean;
  brandColor?: string;
  template?: PresentationTemplate;
}

function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function ImagePlaceholder({ prompt, accent }: { prompt: string | null; accent: string }) {
  return (
    <div
      className="w-full h-full flex items-end justify-start p-4 rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${accent}33 0%, ${accent}66 100%)`,
        minHeight: '100%',
      }}
    >
      {prompt && (
        <p className="text-xs text-neutral-500 italic leading-relaxed">{prompt}</p>
      )}
    </div>
  );
}

export function SlideRenderer({ slide, isFullscreen, template }: SlideRendererProps) {
  const tokens = template?.tokens ?? {
    background: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: '#555555',
    accent: '#6366F1',
    accentLight: '#EEF2FF',
    backgroundAlt: undefined as string | undefined,
    border: '#E5E7EB',
    fontTitle: 'Inter',
    fontBody: 'Inter',
    titleWeight: '700',
    titleAlign: 'left' as const,
    slidePadding: 'p-12',
    showLogo: true,
    showPageNumber: true,
    showFooterRule: false,
    footerText: null as string | null,
  };

  const accent = tokens.accent;
  const pad = isFullscreen ? 'p-16' : (tokens.slidePadding ?? 'p-12');
  const rgb = hexToRgb(accent);

  const BulletList = ({ items }: { items: string[] }) => (
    <ul className="space-y-3 mt-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="mt-2 w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: accent }}
          />
          <span className="text-lg leading-relaxed" style={{ color: tokens.textSecondary }}>{item}</span>
        </li>
      ))}
    </ul>
  );

  // ── TITLE ──────────────────────────────────────────────────────────────────
  if (slide.layout === 'title') {
    return (
      <div className="w-full h-full flex flex-col relative overflow-hidden" style={{ background: tokens.background, color: tokens.textPrimary, fontFamily: tokens.fontBody }}>
        {/* top accent bar */}
        <div className="h-2 w-full flex-shrink-0" style={{ backgroundColor: accent }} />
        {/* content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-20 py-12">
          {slide.title && (
            <h1 className="text-5xl leading-tight mb-6" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>
              {slide.title}
            </h1>
          )}
          {slide.subtitle && (
            <p className="text-2xl leading-relaxed max-w-3xl" style={{ color: tokens.textSecondary }}>
              {slide.subtitle}
            </p>
          )}
          {slide.body && !slide.subtitle && (
            <p className="text-2xl leading-relaxed max-w-3xl" style={{ color: tokens.textSecondary }}>{slide.body}</p>
          )}
        </div>
        {/* bottom accent bar */}
        <div className="h-2 w-full flex-shrink-0" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  // ── BULLETS ────────────────────────────────────────────────────────────────
  if (slide.layout === 'bullets') {
    return (
      <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        <div className="flex items-stretch gap-4 mb-6">
          <div className="w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          {slide.title && (
            <h2 className="text-3xl leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>{slide.title}</h2>
          )}
        </div>
        {slide.bullets && slide.bullets.length > 0 && (
          <BulletList items={slide.bullets} />
        )}
        {slide.body && (!slide.bullets || slide.bullets.length === 0) && (
          <p className="text-lg leading-relaxed mt-4" style={{ color: tokens.textSecondary }}>{slide.body}</p>
        )}
      </div>
    );
  }

  // ── IMAGE LEFT ─────────────────────────────────────────────────────────────
  if (slide.layout === 'image_left') {
    return (
      <div className="w-full h-full flex overflow-hidden" style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {/* image 40% */}
        <div className="w-[40%] h-full relative flex-shrink-0">
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.title || 'Slide image'}
              fill
              className="object-cover rounded-r-lg"
            />
          ) : (
            <ImagePlaceholder prompt={slide.image_prompt} accent={accent} />
          )}
        </div>
        {/* content 60% */}
        <div className={`flex-1 flex flex-col justify-center ${pad}`}>
          {slide.title && (
            <h2 className="text-3xl mb-4 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>{slide.title}</h2>
          )}
          {slide.bullets && slide.bullets.length > 0 && (
            <BulletList items={slide.bullets} />
          )}
          {slide.body && (!slide.bullets || slide.bullets.length === 0) && (
            <p className="text-lg leading-relaxed" style={{ color: tokens.textSecondary }}>{slide.body}</p>
          )}
        </div>
      </div>
    );
  }

  // ── IMAGE RIGHT ────────────────────────────────────────────────────────────
  if (slide.layout === 'image_right') {
    return (
      <div className="w-full h-full flex overflow-hidden" style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {/* content 60% */}
        <div className={`flex-1 flex flex-col justify-center ${pad}`}>
          {slide.title && (
            <h2 className="text-3xl mb-4 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>{slide.title}</h2>
          )}
          {slide.bullets && slide.bullets.length > 0 && (
            <BulletList items={slide.bullets} />
          )}
          {slide.body && (!slide.bullets || slide.bullets.length === 0) && (
            <p className="text-lg leading-relaxed" style={{ color: tokens.textSecondary }}>{slide.body}</p>
          )}
        </div>
        {/* image 40% */}
        <div className="w-[40%] h-full relative flex-shrink-0">
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.title || 'Slide image'}
              fill
              className="object-cover rounded-l-lg"
            />
          ) : (
            <ImagePlaceholder prompt={slide.image_prompt} accent={accent} />
          )}
        </div>
      </div>
    );
  }

  // ── QUOTE ──────────────────────────────────────────────────────────────────
  if (slide.layout === 'quote') {
    const quoteText = slide.bullets?.[0] ?? slide.body ?? '';
    const attribution = slide.bullets?.[1] ?? null;
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center text-center ${pad} relative overflow-hidden`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {/* decorative quote mark */}
        <span
          className="text-9xl font-serif leading-none select-none absolute top-4 left-8 opacity-10"
          style={{ color: accent }}
        >
          &ldquo;
        </span>
        <div className="relative z-10 max-w-3xl">
          <p className="text-3xl italic font-medium leading-relaxed mb-6" style={{ color: tokens.textPrimary }}>
            {quoteText}
          </p>
          {attribution && (
            <p className="text-lg" style={{ color: tokens.textSecondary }}>&mdash; {attribution}</p>
          )}
        </div>
      </div>
    );
  }

  // ── STATS ──────────────────────────────────────────────────────────────────
  if (slide.layout === 'stats') {
    const statItems = (slide.bullets ?? []).map((b) => {
      const [value, label] = b.split('|');
      return { value: value?.trim() ?? b, label: label?.trim() ?? '' };
    });
    return (
      <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {slide.title && (
          <h2 className="text-3xl mb-8 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>{slide.title}</h2>
        )}
        <div className="flex gap-4 flex-1 items-center">
          {statItems.map((stat, i) => (
            <div
              key={i}
              className="flex-1 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
              style={{
                background: tokens.accentLight,
                border: `2px solid ${accent}`,
                boxShadow: `0 4px 24px rgba(${rgb}, 0.08)`,
              }}
            >
              <span
                className="text-4xl font-bold mb-2"
                style={{ color: accent }}
              >
                {stat.value}
              </span>
              <span className="text-sm font-medium uppercase tracking-wide" style={{ color: tokens.textSecondary }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── TWO COL ────────────────────────────────────────────────────────────────
  if (slide.layout === 'two_col') {
    const bullets = slide.bullets ?? [];
    const mid = Math.ceil(bullets.length / 2);
    const leftBullets = bullets.slice(0, mid);
    const rightBullets = bullets.slice(mid);
    return (
      <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {slide.title && (
          <h2 className="text-3xl mb-6 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>{slide.title}</h2>
        )}
        <div className="flex gap-8 flex-1">
          <div className="flex-1">
            {leftBullets.length > 0 && <BulletList items={leftBullets} />}
          </div>
          <div className="w-px flex-shrink-0" style={{ backgroundColor: tokens.border ?? '#E5E7EB' }} />
          <div className="flex-1">
            {rightBullets.length > 0 && <BulletList items={rightBullets} />}
          </div>
        </div>
      </div>
    );
  }

  // ── SECTION ────────────────────────────────────────────────────────────────
  if (slide.layout === 'section') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center text-center relative overflow-hidden"
        style={{
          background: tokens.backgroundAlt ?? `linear-gradient(135deg, rgba(${rgb}, 0.08) 0%, rgba(${rgb}, 0.18) 100%)`,
          fontFamily: tokens.fontBody,
        }}
      >
        <div className="w-24 h-1 rounded-full mb-8" style={{ backgroundColor: accent }} />
        {slide.title && (
          <h2 className="text-5xl leading-tight mb-4 px-16" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: 'center', fontFamily: tokens.fontTitle }}>
            {slide.title}
          </h2>
        )}
        {slide.subtitle && (
          <p className="text-xl max-w-2xl px-16" style={{ color: tokens.textSecondary }}>{slide.subtitle}</p>
        )}
        {slide.body && !slide.subtitle && (
          <p className="text-xl max-w-2xl px-16" style={{ color: tokens.textSecondary }}>{slide.body}</p>
        )}
        <div className="w-24 h-1 rounded-full mt-8" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  // ── NANO STATEMENT ─────────────────────────────────────────────────────────
  if (slide.layout === 'nano_statement') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center text-center px-12 relative overflow-hidden"
        style={{ backgroundColor: accent, fontFamily: tokens.fontBody }}
      >
        {slide.title && (
          <h1
            className={`font-black text-white leading-tight ${isFullscreen ? 'text-6xl' : 'text-5xl'}`}
            style={{ fontFamily: tokens.fontTitle }}
          >
            {slide.title}
          </h1>
        )}
        {slide.subtitle && (
          <p className="text-white/70 text-xl mt-4 leading-relaxed">{slide.subtitle}</p>
        )}
      </div>
    );
  }

  // ── NANO NUMBER ────────────────────────────────────────────────────────────
  if (slide.layout === 'nano_number') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center relative overflow-hidden px-12" style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        <div className="w-24 h-1 rounded-full mb-8" style={{ backgroundColor: accent }} />
        {slide.title && (
          <span
            className={`font-black leading-none ${isFullscreen ? 'text-9xl' : 'text-8xl'}`}
            style={{ color: accent, fontFamily: tokens.fontTitle }}
          >
            {slide.title}
          </span>
        )}
        {slide.subtitle && (
          <p className="text-lg uppercase tracking-widest mt-6" style={{ color: tokens.textSecondary }}>
            {slide.subtitle}
          </p>
        )}
      </div>
    );
  }

  // ── NANO QUESTION ──────────────────────────────────────────────────────────
  if (slide.layout === 'nano_question') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center text-center px-16 relative overflow-hidden"
        style={{
          background: `linear-gradient(to top, rgba(${rgb}, 0.10) 0%, transparent 60%), ${tokens.background}`,
          fontFamily: tokens.fontBody,
        }}
      >
        <span
          className="text-[12rem] font-serif leading-none select-none absolute top-0 left-4 opacity-[0.15] pointer-events-none"
          style={{ color: accent }}
        >
          &ldquo;
        </span>
        {slide.title && (
          <h1
            className={`font-bold italic leading-tight relative z-10 ${isFullscreen ? 'text-6xl' : 'text-5xl'}`}
            style={{ color: tokens.textPrimary, fontFamily: tokens.fontTitle }}
          >
            {slide.title}
          </h1>
        )}
      </div>
    );
  }

  // ── NANO QUOTE ─────────────────────────────────────────────────────────────
  if (slide.layout === 'nano_quote') {
    return (
      <div className="w-full h-full flex overflow-hidden" style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        <div className="w-2 flex-shrink-0" style={{ backgroundColor: accent }} />
        <div className="flex-1 flex flex-col justify-center px-12 py-12">
          {slide.title && (
            <p
              className={`font-semibold italic leading-snug ${isFullscreen ? 'text-5xl' : 'text-4xl'}`}
              style={{ color: tokens.textPrimary, fontFamily: tokens.fontTitle }}
            >
              {slide.title}
            </p>
          )}
          {slide.subtitle && (
            <p className="text-base mt-6" style={{ color: tokens.textSecondary }}>&mdash; {slide.subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  // ── EXEC SUMMARY ───────────────────────────────────────────────────────────
  if (slide.layout === 'exec_summary') {
    const bullets = slide.bullets ?? [];
    return (
      <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {/* Top accent rule */}
        <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: accent }} />
        <div className={`flex-1 flex flex-col ${pad} pt-8`}>
          {/* Section label */}
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-6"
            style={{ color: accent }}
          >
            Executive Summary
          </p>
          {/* Bullet items */}
          <ul className="flex flex-col gap-4 flex-1 justify-center">
            {bullets.map((bullet, i) => {
              const colonIdx = bullet.indexOf(': ');
              const keyTerm = colonIdx !== -1 ? bullet.slice(0, colonIdx) : bullet;
              const rest = colonIdx !== -1 ? bullet.slice(colonIdx + 2) : '';
              return (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1 flex-shrink-0 rounded-sm"
                    style={{ width: 8, height: 8, backgroundColor: accent }}
                  />
                  <span className="text-base leading-relaxed">
                    <span className="font-bold" style={{ color: tokens.textPrimary }}>{keyTerm}:</span>
                    {rest && <span className="font-normal" style={{ color: tokens.textSecondary }}> {rest}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  // ── WATERFALL ──────────────────────────────────────────────────────────────
  if (slide.layout === 'waterfall') {
    const bars = parseWaterfallFromBullets(slide.bullets ?? []);
    return (
      <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {slide.title && (
          <h2 className="text-3xl mb-6 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>
            {slide.title}
          </h2>
        )}
        <div className="flex-1 flex items-start pt-4">
          <WaterfallChart bars={bars} accentColor={accent} textColor={tokens.textPrimary} />
        </div>
      </div>
    );
  }

  // ── TIMELINE ───────────────────────────────────────────────────────────────
  if (slide.layout === 'timeline') {
    const items = parseTimelineFromBullets(slide.bullets ?? []);
    return (
      <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {slide.title && (
          <h2 className="text-3xl mb-8 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>
            {slide.title}
          </h2>
        )}
        <div className="flex-1 flex items-center">
          <TimelineChart items={items} accentColor={accent} textColor={tokens.textPrimary} />
        </div>
      </div>
    );
  }

  // ── COMPARISON ─────────────────────────────────────────────────────────────
  if (slide.layout === 'comparison') {
    const { headers, rows } = parseComparisonFromBullets(slide.bullets ?? []);
    return (
      <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {slide.title && (
          <h2 className="text-3xl mb-6 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>
            {slide.title}
          </h2>
        )}
        <div className="flex-1 flex items-start">
          <ComparisonTable
            headers={headers}
            rows={rows}
            highlightCol={1}
            accentColor={accent}
            accentLight={tokens.accentLight}
            textColor={tokens.textPrimary}
          />
        </div>
      </div>
    );
  }

  // ── PROCESS ────────────────────────────────────────────────────────────────
  if (slide.layout === 'process') {
    const steps = parseProcessFromBullets(slide.bullets ?? []);
    return (
      <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
        {slide.title && (
          <h2 className="text-3xl mb-8 leading-tight" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, textAlign: tokens.titleAlign, fontFamily: tokens.fontTitle }}>
            {slide.title}
          </h2>
        )}
        <div className="flex-1 flex items-center">
          <ProcessFlow steps={steps} accentColor={accent} accentLight={tokens.accentLight} textColor={tokens.textPrimary} />
        </div>
      </div>
    );
  }

  // ── BIG STAT ───────────────────────────────────────────────────────────────
  if (slide.layout === 'big_stat') {
    const label = slide.bullets?.[0] ?? null;
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center text-center ${pad} relative overflow-hidden`}
        style={{ background: tokens.background, fontFamily: tokens.fontBody }}
      >
        {label && (
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: accent }}
          >
            {label}
          </p>
        )}
        {slide.title && (
          <span
            className={`font-black leading-none ${isFullscreen ? 'text-[10rem]' : 'text-9xl'}`}
            style={{ color: accent, fontFamily: tokens.fontTitle }}
          >
            {slide.title}
          </span>
        )}
        {(slide.subtitle ?? slide.body) && (
          <p className="text-xl mt-6 max-w-2xl" style={{ color: tokens.textSecondary }}>
            {slide.subtitle ?? slide.body}
          </p>
        )}
      </div>
    );
  }

  // ── FALLBACK ───────────────────────────────────────────────────────────────
  return (
    <div className={`w-full h-full flex flex-col ${pad}`} style={{ background: tokens.background, fontFamily: tokens.fontBody }}>
      {slide.title && (
        <h2 className="text-3xl mb-4" style={{ color: tokens.textPrimary, fontWeight: tokens.titleWeight, fontFamily: tokens.fontTitle }}>{slide.title}</h2>
      )}
      {slide.body && <p className="text-lg leading-relaxed" style={{ color: tokens.textSecondary }}>{slide.body}</p>}
    </div>
  );
}
