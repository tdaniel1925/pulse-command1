import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: presentation, error } = await admin
    .from('presentations')
    .select('id, status, slides, title, thumbnail_url')
    .eq('id', id)
    .single();

  if (error || !presentation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: presentation.status,
    slides: presentation.slides,
    title: presentation.title,
    thumbnail_url: presentation.thumbnail_url,
  });
}
