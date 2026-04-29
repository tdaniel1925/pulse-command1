'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle, X } from 'lucide-react';
import { SlideRenderer } from './SlideRenderer';
import type { Slide } from './SlideRenderer';

interface SlideGrade {
  index: number;
  score: number;
  flag: 'too_much_text' | 'too_vague' | 'no_visual' | 'weak_title' | 'missing_cta' | null;
  suggestion: string | null;
}

export type { Slide };
export type { SlideLayout } from './SlideRenderer';

export interface Presentation {
  id: string;
  client_id: string;
  title: string;
  topic: string;
  audience: string | null;
  tone: string;
  slide_count: number;
  slides: Slide[];
  status: string;
  thumbnail_url: string | null;
  created_at: string;
}

interface PresentationViewerProps {
  presentation: Presentation;
  isGenerating: boolean;
}

export function PresentationViewer({ presentation: initialPresentation, isGenerating }: PresentationViewerProps) {
  const [presentation, setPresentation] = useState<Presentation>(initialPresentation);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isPolling, setIsPolling] = useState(isGenerating || initialPresentation.status === 'generating');
  const [exportLoading, setExportLoading] = useState<'pdf' | 'pptx' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [grades, setGrades] = useState<SlideGrade[] | null>(null);
  const [showGrader, setShowGrader] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const slidesRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = presentation.slides ?? [];
  const total = slides.length;
  const slide = slides[currentSlide];

  // ── TOAST ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── POLLING ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPolling) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/presentations/${presentation.id}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'ready' || data.status === 'complete') {
          setPresentation((prev) => ({
            ...prev,
            status: 'ready',
            slides: data.slides ?? prev.slides,
            title: data.title ?? prev.title,
            thumbnail_url: data.thumbnail_url ?? prev.thumbnail_url,
          }));
          setIsPolling(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // silently retry
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isPolling, presentation.id]);

  // ── KEYBOARD ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          setCurrentSlide((c) => Math.min(c + 1, total - 1));
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          setCurrentSlide((c) => Math.max(c - 1, 0));
          break;
        case 'f':
        case 'F':
          setIsFullscreen((f) => !f);
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total]);

  // ── EXPORT PDF ─────────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    try {
      setExportLoading('pdf');
      showToast('Generating PDF…');
      const html2pdf = (await import('html2pdf.js')).default;
      if (!slidesRef.current) return;
      const opt = {
        filename: `${presentation.title}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: [13.33, 7.5] as [number, number], orientation: 'landscape' as const },
      };
      await html2pdf().set(opt).from(slidesRef.current).save();
      showToast('PDF downloaded!');
    } catch {
      alert('PDF export is unavailable. Please contact support.');
    } finally {
      setExportLoading(null);
    }
  };

  // ── EXPORT PPTX ────────────────────────────────────────────────────────────
  const handleExportPptx = async () => {
    try {
      setExportLoading('pptx');
      showToast('Generating PPTX…');
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';

      for (const s of slides) {
        const slide = pptx.addSlide();
        const accentHex = s.accent_color?.replace('#', '') || '6366f1';

        if (s.layout === 'title') {
          if (s.title) {
            slide.addText(s.title, {
              x: 0.5, y: 2, w: 12, h: 1.5,
              fontSize: 40, bold: true, color: '363636', align: 'center',
            });
          }
          if (s.subtitle) {
            slide.addText(s.subtitle, {
              x: 0.5, y: 3.8, w: 12, h: 1,
              fontSize: 24, color: '737373', align: 'center',
            });
          }
        } else if (s.layout === 'bullets' || s.layout === 'two_col') {
          if (s.title) {
            slide.addText(s.title, {
              x: 0.5, y: 0.4, w: 12, h: 0.8,
              fontSize: 28, bold: true, color: '363636',
            });
          }
          if (s.bullets && s.bullets.length > 0) {
            const bulletItems = s.bullets.map((b) => ({ text: b, options: { bullet: true } }));
            slide.addText(bulletItems, {
              x: 0.5, y: 1.5, w: 12, h: 5,
              fontSize: 18, color: '404040',
            });
          }
        } else if (s.layout === 'quote') {
          const quoteText = s.bullets?.[0] ?? s.body ?? '';
          const attribution = s.bullets?.[1] ?? null;
          slide.addText(`"${quoteText}"`, {
            x: 1, y: 2, w: 11, h: 2,
            fontSize: 28, italic: true, color: '363636', align: 'center',
          });
          if (attribution) {
            slide.addText(`— ${attribution}`, {
              x: 1, y: 4.2, w: 11, h: 0.5,
              fontSize: 18, color: '737373', align: 'center',
            });
          }
        } else if (s.layout === 'stats') {
          if (s.title) {
            slide.addText(s.title, {
              x: 0.5, y: 0.4, w: 12, h: 0.8,
              fontSize: 28, bold: true, color: '363636',
            });
          }
          const statItems = (s.bullets ?? []).map((b) => {
            const [value, label] = b.split('|');
            return { value: value?.trim() ?? b, label: label?.trim() ?? '' };
          });
          statItems.forEach((stat, i) => {
            const x = 0.5 + i * 4.3;
            slide.addText(stat.value, {
              x, y: 2, w: 4, h: 1.2,
              fontSize: 36, bold: true, color: accentHex, align: 'center',
            });
            slide.addText(stat.label, {
              x, y: 3.3, w: 4, h: 0.5,
              fontSize: 14, color: '737373', align: 'center',
            });
          });
        } else {
          // Generic fallback for section, image_left, image_right
          if (s.title) {
            slide.addText(s.title, {
              x: 0.5, y: 0.4, w: 12, h: 0.8,
              fontSize: 28, bold: true, color: '363636',
            });
          }
          if (s.body) {
            slide.addText(s.body, {
              x: 0.5, y: 1.5, w: 12, h: 5,
              fontSize: 18, color: '404040',
            });
          }
          if (s.bullets && s.bullets.length > 0) {
            const bulletItems = s.bullets.map((b) => ({ text: b, options: { bullet: true } }));
            slide.addText(bulletItems, {
              x: 0.5, y: 1.5, w: 12, h: 5,
              fontSize: 18, color: '404040',
            });
          }
        }
      }

      await pptx.writeFile({ fileName: `${presentation.title}.pptx` });
      showToast('PPTX downloaded!');
    } catch {
      alert('PPTX export is unavailable. Please contact support.');
    } finally {
      setExportLoading(null);
    }
  };

  // ── GRADE DECK ─────────────────────────────────────────────────────────────
  const handleGrade = async () => {
    try {
      setIsGrading(true);
      const res = await fetch(`/api/presentations/${presentation.id}/grade`, { method: 'POST' });
      if (!res.ok) throw new Error('Grade request failed');
      const data = await res.json() as { grades: SlideGrade[] };
      setGrades(data.grades);
      setShowGrader(true);
    } catch {
      showToast('Grading failed. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  // ── FULLSCREEN MODE ────────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
        onClick={() => setCurrentSlide((c) => Math.min(c + 1, total - 1))}
      >
        {/* 16:9 slide */}
        <div
          className="relative"
          style={{
            width: 'min(100vw, calc(100vh * 16 / 9))',
            height: 'min(100vh, calc(100vw * 9 / 16))',
          }}
        >
          {slide && <SlideRenderer slide={slide} isFullscreen={true} />}
        </div>

        {/* Bottom controls */}
        <div
          className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setCurrentSlide((c) => Math.max(c - 1, 0))}
            disabled={currentSlide === 0}
            className="text-white/60 hover:text-white disabled:opacity-30 transition-colors p-2"
          >
            ←
          </button>
          <span className="text-white/70 text-sm font-medium">
            {currentSlide + 1} / {total}
          </span>
          <button
            onClick={() => setCurrentSlide((c) => Math.min(c + 1, total - 1))}
            disabled={currentSlide === total - 1}
            className="text-white/60 hover:text-white disabled:opacity-30 transition-colors p-2"
          >
            →
          </button>
          <button
            onClick={() => setIsFullscreen(false)}
            className="text-white/40 hover:text-white/70 text-xs transition-colors ml-4"
          >
            ESC to exit
          </button>
        </div>
      </div>
    );
  }

  // ── GENERATING OVERLAY ─────────────────────────────────────────────────────
  const GeneratingOverlay = () => (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 rounded-xl">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <div className="text-center">
        <p className="font-semibold text-neutral-900">Generating your presentation…</p>
        <p className="text-sm text-neutral-500 mt-1">This usually takes 30–60 seconds</p>
      </div>
    </div>
  );

  // ── NORMAL MODE ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-neutral-100 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-neutral-200 flex-shrink-0">
        <Link
          href="/dashboard/presentations"
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mr-2"
        >
          <span>←</span>
          <span>Back</span>
        </Link>
        <div className="w-px h-5 bg-neutral-200" />
        <h1 className="text-sm font-semibold text-neutral-900 flex-1 truncate">{presentation.title}</h1>

        {/* toolbar buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showNotes
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Speaker Notes
          </button>
          <button
            onClick={() => setShowThumbnails((v) => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showThumbnails
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Thumbnails
          </button>
          <button
            onClick={handleGrade}
            disabled={isGrading || isPolling}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {isGrading ? (
              <>
                <span className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                Grading…
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Grade Deck
              </>
            )}
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            ⛶ Fullscreen
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportLoading === 'pdf' || isPolling}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {exportLoading === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
          <button
            onClick={handleExportPptx}
            disabled={exportLoading === 'pptx' || isPolling}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {exportLoading === 'pptx' ? 'Exporting…' : 'Export PPTX'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails panel */}
        {showThumbnails && (
          <div className="w-48 flex-shrink-0 bg-white border-r border-neutral-200 overflow-y-auto py-3 flex flex-col gap-2 px-2">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  i === currentSlide
                    ? 'border-primary-500 shadow-md'
                    : 'border-transparent hover:border-neutral-300'
                }`}
                style={{ aspectRatio: '16/9' }}
              >
                <div className="w-full h-full" style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '285%', height: '285%', pointerEvents: 'none' }}>
                  <SlideRenderer slide={s} isFullscreen={false} />
                </div>
                <span className="absolute bottom-1 right-1 text-[9px] font-medium text-neutral-400 bg-white/80 rounded px-1">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slide display */}
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            {isPolling && <GeneratingOverlay />}
            <div
              ref={slidesRef}
              className="relative rounded-xl overflow-hidden shadow-2xl bg-white"
              style={{
                width: 'min(100%, calc((100vh - 220px) * 16 / 9))',
                aspectRatio: '16/9',
              }}
            >
              {slide ? (
                <SlideRenderer slide={slide} isFullscreen={false} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  No slides available
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 py-3 bg-white border-t border-neutral-200 flex-shrink-0">
            <button
              onClick={() => setCurrentSlide((c) => Math.max(c - 1, 0))}
              disabled={currentSlide === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 transition-colors text-sm"
            >
              ←
            </button>
            <span className="text-sm font-medium text-neutral-700 min-w-[80px] text-center">
              {total > 0 ? `${currentSlide + 1} / ${total}` : '—'}
            </span>
            <button
              onClick={() => setCurrentSlide((c) => Math.min(c + 1, total - 1))}
              disabled={currentSlide === total - 1 || total === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 transition-colors text-sm"
            >
              →
            </button>
          </div>

          {/* Speaker notes */}
          {showNotes && slide?.speaker_notes && (
            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 flex-shrink-0 max-h-40 overflow-y-auto">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Speaker Notes</p>
              <p className="text-sm text-neutral-700 leading-relaxed">{slide.speaker_notes}</p>
            </div>
          )}
          {showNotes && slide && !slide.speaker_notes && (
            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 flex-shrink-0">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Speaker Notes</p>
              <p className="text-sm text-neutral-400 italic">No notes for this slide.</p>
            </div>
          )}
        </div>
      </div>

      {/* Grader Panel */}
      {showGrader && grades && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg max-h-64 overflow-y-auto">
          <div className="px-4 py-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-neutral-900">Deck Quality Report</span>
                {(() => {
                  const avg = Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length);
                  const color = avg >= 7 ? 'bg-green-100 text-green-700' : avg >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                  return (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
                      {avg}/10
                    </span>
                  );
                })()}
                {grades.some((g) => g.score < 7) && (
                  <span className="text-xs text-amber-600 font-medium">
                    {grades.filter((g) => g.score < 7).length} slides need attention
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowGrader(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grade pills */}
            <div className="flex flex-wrap gap-2">
              {grades.map((grade) => {
                const scoreColor =
                  grade.score >= 7
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : grade.score >= 5
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-red-50 border-red-200 text-red-700';
                const badgeColor =
                  grade.score >= 7
                    ? 'bg-green-100 text-green-800'
                    : grade.score >= 5
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800';

                return (
                  <div key={grade.index} className="relative group">
                    <button
                      onClick={() => setCurrentSlide(grade.index)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-80 ${scoreColor}`}
                    >
                      <span>Slide {grade.index + 1}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${badgeColor}`}>
                        {grade.score}
                      </span>
                      {grade.flag && <span>⚠️</span>}
                    </button>
                    {grade.suggestion && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                        {grade.suggestion}
                        <div className="absolute top-full left-4 border-4 border-transparent border-t-neutral-900" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
