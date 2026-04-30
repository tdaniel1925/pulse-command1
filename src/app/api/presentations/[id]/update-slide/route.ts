import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as { slideIndex: number; updates: Record<string, unknown> };
  const { slideIndex, updates } = body;

  if (typeof slideIndex !== 'number' || !updates) {
    return NextResponse.json({ error: 'slideIndex and updates are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: presentation, error: presError } = await admin
    .from('presentations')
    .select('slides')
    .eq('id', id)
    .single();

  if (presError || !presentation) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
  }

  const slides = presentation.slides as Record<string, unknown>[];

  if (!slides[slideIndex]) {
    return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
  }

  slides[slideIndex] = { ...slides[slideIndex], ...updates };

  const { error: updateError } = await admin
    .from('presentations')
    .update({ slides, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) {
    console.error('[update-slide] Update failed:', updateError.message);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
