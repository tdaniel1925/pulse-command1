import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get client record
  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('id, business_name, brand_colors, presentations_used, presentations_limit')
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Trial check
  if ((client.presentations_used ?? 0) >= (client.presentations_limit ?? 1)) {
    return NextResponse.json(
      { error: 'trial_exhausted', upgradeRequired: true },
      { status: 403 }
    );
  }

  // Parse body
  const body = await req.json();
  const { topic, audience, tone, slideCount } = body as {
    topic: string;
    audience?: string;
    tone?: string;
    slideCount?: number;
  };

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  // Create presentation row
  const { data: presentation, error: insertError } = await admin
    .from('presentations')
    .insert({
      client_id: client.id,
      title: topic,
      topic,
      audience: audience ?? null,
      tone: tone ?? 'professional',
      slide_count: slideCount ?? 10,
      status: 'generating',
    })
    .select('id')
    .single();

  if (insertError || !presentation) {
    return NextResponse.json({ error: 'Failed to create presentation' }, { status: 500 });
  }

  // Increment presentations_used
  await admin
    .from('clients')
    .update({ presentations_used: (client.presentations_used ?? 0) + 1 })
    .eq('id', client.id);

  // Fire-and-forget build
  const buildUrl = new URL(
    `/api/presentations/${presentation.id}/build`,
    req.nextUrl.origin
  ).toString();

  fetch(buildUrl, { method: 'POST' }).catch((err) => {
    console.error('[presentations/generate] build trigger failed:', err?.message ?? err);
  });

  return NextResponse.json({ id: presentation.id });
}
