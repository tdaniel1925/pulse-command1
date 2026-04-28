export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: video, error } = await supabase
    .from('content_items')
    .select('*, clients(business_name, first_name, last_name)')
    .eq('id', id)
    .eq('type', 'short_video')
    .single();

  if (error || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  const client = video.clients as { business_name?: string; first_name?: string; last_name?: string } | null;
  const businessName = client?.business_name ?? 'BundledContent';
  const metadata = (video.metadata ?? {}) as Record<string, unknown>;

  return NextResponse.json({
    id: video.id,
    title: `${businessName} - Short Video`,
    url: video.url,
    businessName,
    heygenVideoId: metadata.heygen_video_id ?? null,
    createdAt: video.created_at,
  });
}
