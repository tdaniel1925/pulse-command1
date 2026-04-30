'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle, X, Pencil, Check, Loader2, Sparkles } from 'lucide-react';
import { SlideRenderer } from './SlideRenderer';
import { SlideMaster } from './SlideMaster';
import { getAllTemplates, getTemplate } from '@/lib/presentation-templates';
import type { PresentationTemplate, TemplateId } from '@/lib/presentation-templates';
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
  template_id?: string | null;
}

interface PresentationViewerProps {
  presentation: Presentation;
  isGenerating: boolean;
}

const SUBTITLE_LAYOUTS = new Set(['title', 'section', 'nano_statement', 'nano_number', 'nano_quote']);

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
  const [activeTemplate, setActiveTemplate] = useState<PresentationTemplate>(
    () => getTemplate((initialPresentation.template_id ?? 'pitch') as TemplateId)
  );
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const allTemplates = getAllTemplates();

  // ── EDIT MODE STATE ────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [localSlides, setLocalSlides] = useState<Slide[]>(initialPresentation.slides ?? []);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  // Keep localSlides in sync when polling completes
  useEffect(() => {
    setLocalSlides(presentation.slides ?? []);
  }, [presentation.slides]);

  const slidesRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = localSlides;
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

  // ── EDIT HELPERS ───────────────────────────────────────────────────────────
  function updateLocalSlide(index: number, updates: Partial<Slide>) {
    setLocalSlides((prev) => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  }

  async function handleSaveSlide(index: number) {
    const s = localSlides[index];
    await fetch(`/api/presentations/${presentation.id}/update-slide`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideIndex: index, updates: s }),
    });
    showToast('Slide saved.');
  }

  async function handleRegenerateSlide(index: number) {
    setIsRegenerating(true);
    setRegeneratingIndex(index);
    try {
      const res = await fetch(`/api/presentations/${presentation.id}/regenerate-slide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideIndex: index }),
      });
      const data = await res.json() as { slide?: Slide };
      if (data.slide) {
        updateLocalSlide(index, data.slide);
        showToast('Slide regenerated!');
      }
    } catch {
      showToast('Regeneration failed. Please try again.');
    } finally {
      setIsRegenerating(false);
      setRegeneratingIndex(null);
    }
  }

  function revertSlide(index: number) {
    const original = presentation.slides[index];
    if (original) {
      setLocalSlides((prev) => prev.map((s, i) => i === index ? original : s));
    }
  }

  async function moveSlide(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localSlides.length) return;

    const newSlides = [...localSlides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    setLocalSlides(newSlides);

    // Save both swapped slides
    await Promise.all([
      fetch(`/api/presentations/${presentation.id}/update-slide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideIndex: index, updates: newSlides[index] }),
      }),
      fetch(`/api/presentations/${presentation.id}/update-slide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideIndex: targetIndex, updates: newSlides[targetIndex] }),
      }),
    ]);

    // Keep current slide focused on the moved slide
    setCurrentSlide(targetIndex);
  }

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
        const pptxSlide = pptx.addSlide();
        const accentHex = s.accent_color?.replace('#', '') || '6366f1';

        if (s.layout === 'title') {
          if (s.title) {
            pptxSlide.addText(s.title, {
              x: 0.5, y: 2, w: 12, h: 1.5,
              fontSize: 40, bold: true, color: '363636', align: 'center',
            });
          }
          if (s.subtitle) {
            pptxSlide.addText(s.subtitle, {
              x: 0.5, y: 3.8, w: 12, h: 1,
              fontSize: 24, color: '737373', align: 'center',
            });
          }
        } else if (s.layout === 'bullets' || s.layout === 'two_col') {
          if (s.title) {
            pptxSlide.addText(s.title, {
              x: 0.5, y: 0.4, w: 12, h: 0.8,
              fontSize: 28, bold: true, color: '363636',
            });
          }
          if (s.bullets && s.bullets.length > 0) {
            const bulletItems = s.bullets.map((b) => ({ text: b, options: { bullet: true } }));
            pptxSlide.addText(bulletItems, {
              x: 0.5, y: 1.5, w: 12, h: 5,
              fontSize: 18, color: '404040',
            });
          }
        } else if (s.layout === 'quote') {
          const quoteText = s.bullets?.[0] ?? s.body ?? '';
          const attribution = s.bullets?.[1] ?? null;
          pptxSlide.addText(`"${quoteText}"`, {
            x: 1, y: 2, w: 11, h: 2,
            fontSize: 28, italic: true, color: '363636', align: 'center',
          });
          if (attribution) {
            pptxSlide.addText(`— ${attribution}`, {
              x: 1, y: 4.2, w: 11, h: 0.5,
              fontSize: 18, color: '737373', align: 'center',
            });
          }
        } else if (s.layout === 'stats') {
          if (s.title) {
            pptxSlide.addText(s.title, {
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
            pptxSlide.addText(stat.value, {
              x, y: 2, w: 4, h: 1.2,
              fontSize: 36, bold: true, color: accentHex, align: 'center',
            });
            pptxSlide.addText(stat.label, {
              x, y: 3.3, w: 4, h: 0.5,
              fontSize: 14, color: '737373', align: 'center',
            });
          });
        } else {
          if (s.title) {
            pptxSlide.addText(s.title, {
              x: 0.5, y: 0.4, w: 12, h: 0.8,
              fontSize: 28, bold: true, color: '363636',
            });
          }
          if (s.body) {
            pptxSlide.addText(s.body, {
              x: 0.5, y: 1.5, w: 12, h: 5,
              fontSize: 18, color: '404040',
            });
          }
          if (s.bullets && s.bullets.length > 0) {
            const bulletItems = s.bullets.map((b) => ({ text: b, options: { bullet: true } }));
            pptxSlide.addText(bulletItems, {
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
        <div
          className="relative"
          style={{
            width: 'min(100vw, calc(100vh * 16 / 9))',
            height: 'min(100vh, calc(100vw * 9 / 16))',
          }}
        >
          {slide && (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <SlideRenderer slide={slide} isFullscreen={true} template={activeTemplate} />
              <SlideMaster
                template={activeTemplate}
                slideNumber={currentSlide + 1}
                totalSlides={total}
                businessName={presentation.title}
                isFullscreen={true}
              />
            </div>
          )}
        </div>

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

  const currentSlideData = slides[currentSlide];
  const showSubtitleField = currentSlideData && SUBTITLE_LAYOUTS.has(currentSlideData.layout);
  const showBulletsField = currentSlideData && Array.isArray(currentSlideData.bullets);

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
          {/* Edit toggle */}
          <button
            onClick={() => setEditMode((v) => !v)}
            disabled={isPolling}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
              editMode
                ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {editMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Done Editing
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                Edit Slides
              </>
            )}
          </button>

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
          {/* Template switcher */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatePicker((v) => !v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showTemplatePicker
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Template: {activeTemplate.name}
            </button>
            {showTemplatePicker && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-neutral-200 shadow-xl z-30 p-2">
                {allTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => { setActiveTemplate(tmpl); setShowTemplatePicker(false); }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTemplate.id === tmpl.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xs text-neutral-400 font-normal">{tmpl.vibe}</span>
                    {tmpl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              <div key={i} className="flex flex-col gap-1">
                {/* Reorder arrows — edit mode only */}
                {editMode && (
                  <div className="flex gap-1 justify-end px-0.5">
                    <button
                      onClick={() => moveSlide(i, 'up')}
                      disabled={i === 0}
                      className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20 transition-colors text-xs leading-none"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSlide(i, 'down')}
                      disabled={i === slides.length - 1}
                      className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20 transition-colors text-xs leading-none"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative group">
                  <button
                    onClick={() => setCurrentSlide(i)}
                    className={`relative w-full rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === currentSlide
                        ? 'border-primary-500 shadow-md'
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                    style={{ aspectRatio: '16/9' }}
                  >
                    <div className="w-full h-full" style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '285%', height: '285%', pointerEvents: 'none' }}>
                      <SlideRenderer slide={s} isFullscreen={false} template={activeTemplate} />
                    </div>
                    <span className="absolute bottom-1 right-1 text-[9px] font-medium text-neutral-400 bg-white/80 rounded px-1">
                      {i + 1}
                    </span>
                    {/* Regenerating spinner overlay on thumbnail */}
                    {isRegenerating && regeneratingIndex === i && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      </div>
                    )}
                  </button>

                  {/* AI regenerate icon on thumbnail hover — edit mode only */}
                  {editMode && (
                    <button
                      onClick={() => handleRegenerateSlide(i)}
                      disabled={isRegenerating}
                      className="absolute top-1 left-1 w-5 h-5 bg-purple-600 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                      title="Regenerate with AI"
                    >
                      <span className="text-[10px] leading-none">✦</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Slide display */}
          <div className="flex items-center justify-center p-6 relative">
            {isPolling && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <GeneratingOverlay />
              </div>
            )}
            <div
              ref={slidesRef}
              className="relative rounded-xl overflow-hidden shadow-2xl bg-white w-full"
              style={{
                width: 'min(100%, calc((100vh - 220px) * 16 / 9))',
                aspectRatio: '16/9',
              }}
            >
              {slide ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <SlideRenderer slide={slide} isFullscreen={false} template={activeTemplate} />
                  <SlideMaster
                    template={activeTemplate}
                    slideNumber={currentSlide + 1}
                    totalSlides={total}
                    businessName={presentation.title}
                    isFullscreen={false}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  No slides available
                </div>
              )}
            </div>
          </div>

          {/* ── EDIT PANEL ── */}
          {editMode && currentSlideData && (
            <div className="mx-6 mb-4 bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Edit Slide {currentSlide + 1}
              </p>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-700">Slide Title</label>
                <input
                  value={currentSlideData.title ?? ''}
                  onChange={(e) => updateLocalSlide(currentSlide, { title: e.target.value })}
                  className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* Subtitle */}
              {showSubtitleField && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-700">Subtitle</label>
                  <input
                    value={currentSlideData.subtitle ?? ''}
                    onChange={(e) => updateLocalSlide(currentSlide, { subtitle: e.target.value || null })}
                    className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              )}

              {/* Bullets */}
              {showBulletsField && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-700">Bullet Points (one per line)</label>
                  <textarea
                    value={currentSlideData.bullets?.join('\n') ?? ''}
                    onChange={(e) =>
                      updateLocalSlide(currentSlide, {
                        bullets: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    rows={5}
                    className="w-full border border-neutral-200 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y"
                  />
                </div>
              )}

              {/* Speaker Notes */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-700">Speaker Notes</label>
                <textarea
                  value={currentSlideData.speaker_notes ?? ''}
                  onChange={(e) => updateLocalSlide(currentSlide, { speaker_notes: e.target.value || null })}
                  rows={3}
                  className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleSaveSlide(currentSlide)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => handleRegenerateSlide(currentSlide)}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  {isRegenerating && regeneratingIndex === currentSlide ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Regenerating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Regenerate with AI
                    </>
                  )}
                </button>
                <button
                  onClick={() => revertSlide(currentSlide)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
                >
                  Revert
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 py-3 bg-white border-t border-neutral-200 flex-shrink-0 mt-auto">
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
