'use client';

import Image from 'next/image';

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
  | 'exec_summary';

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

export function SlideRenderer({ slide, isFullscreen }: SlideRendererProps) {
  const accent = slide.accent_color || '#6366f1';
  const pad = isFullscreen ? 'p-16' : 'p-12';
  const rgb = hexToRgb(accent);

  const BulletList = ({ items }: { items: string[] }) => (
    <ul className="space-y-3 mt-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="mt-2 w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: accent }}
          />
          <span className="text-lg text-neutral-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );

  // ── TITLE ──────────────────────────────────────────────────────────────────
  if (slide.layout === 'title') {
    return (
      <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
        {/* top accent bar */}
        <div className="h-2 w-full flex-shrink-0" style={{ backgroundColor: accent }} />
        {/* content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-20 py-12">
          {slide.title && (
            <h1 className="text-5xl font-bold text-neutral-900 leading-tight mb-6">
              {slide.title}
            </h1>
          )}
          {slide.subtitle && (
            <p className="text-2xl text-neutral-500 leading-relaxed max-w-3xl">
              {slide.subtitle}
            </p>
          )}
          {slide.body && !slide.subtitle && (
            <p className="text-2xl text-neutral-500 leading-relaxed max-w-3xl">{slide.body}</p>
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
      <div className={`w-full h-full bg-white flex flex-col ${pad}`}>
        <div className="flex items-stretch gap-4 mb-6">
          <div className="w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          {slide.title && (
            <h2 className="text-3xl font-bold text-neutral-900 leading-tight">{slide.title}</h2>
          )}
        </div>
        {slide.bullets && slide.bullets.length > 0 && (
          <BulletList items={slide.bullets} />
        )}
        {slide.body && (!slide.bullets || slide.bullets.length === 0) && (
          <p className="text-lg text-neutral-700 leading-relaxed mt-4">{slide.body}</p>
        )}
      </div>
    );
  }

  // ── IMAGE LEFT ─────────────────────────────────────────────────────────────
  if (slide.layout === 'image_left') {
    return (
      <div className="w-full h-full bg-white flex overflow-hidden">
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
            <h2 className="text-3xl font-bold text-neutral-900 mb-4 leading-tight">{slide.title}</h2>
          )}
          {slide.bullets && slide.bullets.length > 0 && (
            <BulletList items={slide.bullets} />
          )}
          {slide.body && (!slide.bullets || slide.bullets.length === 0) && (
            <p className="text-lg text-neutral-700 leading-relaxed">{slide.body}</p>
          )}
        </div>
      </div>
    );
  }

  // ── IMAGE RIGHT ────────────────────────────────────────────────────────────
  if (slide.layout === 'image_right') {
    return (
      <div className="w-full h-full bg-white flex overflow-hidden">
        {/* content 60% */}
        <div className={`flex-1 flex flex-col justify-center ${pad}`}>
          {slide.title && (
            <h2 className="text-3xl font-bold text-neutral-900 mb-4 leading-tight">{slide.title}</h2>
          )}
          {slide.bullets && slide.bullets.length > 0 && (
            <BulletList items={slide.bullets} />
          )}
          {slide.body && (!slide.bullets || slide.bullets.length === 0) && (
            <p className="text-lg text-neutral-700 leading-relaxed">{slide.body}</p>
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
      <div className={`w-full h-full bg-white flex flex-col items-center justify-center text-center ${pad} relative overflow-hidden`}>
        {/* decorative quote mark */}
        <span
          className="text-9xl font-serif leading-none select-none absolute top-4 left-8 opacity-10"
          style={{ color: accent }}
        >
          &ldquo;
        </span>
        <div className="relative z-10 max-w-3xl">
          <p className="text-3xl italic font-medium text-neutral-800 leading-relaxed mb-6">
            {quoteText}
          </p>
          {attribution && (
            <p className="text-lg text-neutral-500">&mdash; {attribution}</p>
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
      <div className={`w-full h-full bg-white flex flex-col ${pad}`}>
        {slide.title && (
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 leading-tight">{slide.title}</h2>
        )}
        <div className="flex gap-4 flex-1 items-center">
          {statItems.map((stat, i) => (
            <div
              key={i}
              className="flex-1 bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center"
              style={{
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
              <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide">
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
      <div className={`w-full h-full bg-white flex flex-col ${pad}`}>
        {slide.title && (
          <h2 className="text-3xl font-bold text-neutral-900 mb-6 leading-tight">{slide.title}</h2>
        )}
        <div className="flex gap-8 flex-1">
          <div className="flex-1">
            {leftBullets.length > 0 && <BulletList items={leftBullets} />}
          </div>
          <div className="w-px bg-neutral-100 flex-shrink-0" />
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
          background: `linear-gradient(135deg, rgba(${rgb}, 0.08) 0%, rgba(${rgb}, 0.18) 100%)`,
        }}
      >
        {/* decorative horizontal rule */}
        <div className="w-24 h-1 rounded-full mb-8" style={{ backgroundColor: accent }} />
        {slide.title && (
          <h2 className="text-5xl font-bold text-neutral-900 leading-tight mb-4 px-16">
            {slide.title}
          </h2>
        )}
        {slide.subtitle && (
          <p className="text-xl text-neutral-600 max-w-2xl px-16">{slide.subtitle}</p>
        )}
        {slide.body && !slide.subtitle && (
          <p className="text-xl text-neutral-600 max-w-2xl px-16">{slide.body}</p>
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
        style={{ backgroundColor: accent }}
      >
        {slide.title && (
          <h1
            className={`font-black text-white leading-tight ${
              isFullscreen ? 'text-6xl' : 'text-5xl'
            }`}
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
      <div className="w-full h-full bg-white flex flex-col items-center justify-center text-center relative overflow-hidden px-12">
        {/* Thin accent line above the number */}
        <div className="w-24 h-1 rounded-full mb-8" style={{ backgroundColor: accent }} />
        {slide.title && (
          <span
            className={`font-black leading-none ${isFullscreen ? 'text-9xl' : 'text-8xl'}`}
            style={{ color: accent }}
          >
            {slide.title}
          </span>
        )}
        {slide.subtitle && (
          <p className="text-neutral-400 text-lg uppercase tracking-widest mt-6">
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
          background: `linear-gradient(to top, rgba(${rgb}, 0.10) 0%, transparent 60%)`,
        }}
      >
        {/* Large decorative quotation mark */}
        <span
          className="text-[12rem] font-serif leading-none select-none absolute top-0 left-4 opacity-[0.15] pointer-events-none"
          style={{ color: accent }}
        >
          &ldquo;
        </span>
        {slide.title && (
          <h1
            className={`font-bold italic text-neutral-900 leading-tight relative z-10 ${
              isFullscreen ? 'text-6xl' : 'text-5xl'
            }`}
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
      <div className="w-full h-full bg-white flex overflow-hidden">
        {/* Left accent border */}
        <div className="w-2 flex-shrink-0" style={{ backgroundColor: accent }} />
        <div className="flex-1 flex flex-col justify-center px-12 py-12">
          {slide.title && (
            <p
              className={`font-semibold italic text-neutral-800 leading-snug ${
                isFullscreen ? 'text-5xl' : 'text-4xl'
              }`}
            >
              {slide.title}
            </p>
          )}
          {slide.subtitle && (
            <p className="text-neutral-400 text-base mt-6">&mdash; {slide.subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  // ── EXEC SUMMARY ───────────────────────────────────────────────────────────
  if (slide.layout === 'exec_summary') {
    const bullets = slide.bullets ?? [];
    return (
      <div className="w-full h-full bg-white flex flex-col overflow-hidden">
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
                    <span className="font-bold text-neutral-900">{keyTerm}:</span>
                    {rest && <span className="font-normal text-neutral-600"> {rest}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  // ── FALLBACK ───────────────────────────────────────────────────────────────
  return (
    <div className={`w-full h-full bg-white flex flex-col ${pad}`}>
      {slide.title && (
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">{slide.title}</h2>
      )}
      {slide.body && <p className="text-lg text-neutral-700 leading-relaxed">{slide.body}</p>}
    </div>
  );
}
