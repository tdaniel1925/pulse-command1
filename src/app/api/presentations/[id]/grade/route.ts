import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateJSON, LIGHT_MODEL } from '@/lib/openrouter';

export interface SlideGrade {
  index: number;
  score: number;
  flag: 'too_much_text' | 'too_vague' | 'no_visual' | 'weak_title' | 'missing_cta' | null;
  suggestion: string | null;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: presentation, error } = await admin
    .from('presentations')
    .select('id, title, slides')
    .eq('id', id)
    .single();

  if (error || !presentation) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
  }

  const slides = presentation.slides as Array<{
    index: number;
    layout: string;
    title: string | null;
    subtitle: string | null;
    bullets: string[] | null;
  }>;

  if (!slides || slides.length === 0) {
    return NextResponse.json({ error: 'No slides to grade' }, { status: 400 });
  }

  try {
    const grades = await generateJSON<SlideGrade[]>({
      model: LIGHT_MODEL,
      maxTokens: 2000,
      prompt: `You are a presentation design expert. Grade each slide of this presentation.

For each slide, evaluate:
1. Clarity (is the message immediately clear?)
2. Specificity (are claims backed by specifics, not vague?)
3. Visual balance (is the right amount of content on the slide?)

Slides to grade:
${slides.map((s) => `Slide ${s.index + 1} [${s.layout}]: "${s.title ?? '(no title)'}" — ${s.bullets?.length ? s.bullets.length + ' bullets' : s.subtitle ?? 'no body'}`).join('\n')}

Return ONLY valid JSON array, one object per slide:
[
  {
    "index": 0,
    "score": 8,
    "flag": null,
    "suggestion": null
  },
  {
    "index": 1,
    "score": 5,
    "flag": "too_much_text",
    "suggestion": "7 bullets is too many. Split into two slides or reduce to the 3 most important points."
  }
]

flag options: null | "too_much_text" | "too_vague" | "no_visual" | "weak_title" | "missing_cta"
score: 1-10 (7+ is good, 5-6 needs improvement, below 5 needs attention)
suggestion: specific actionable fix, or null if score >= 7`,
    });

    return NextResponse.json({ grades });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[grade] Grading failed:', message);
    return NextResponse.json({ error: 'Grading failed' }, { status: 500 });
  }
}
