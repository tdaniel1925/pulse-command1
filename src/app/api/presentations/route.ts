import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
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
    .select('id, presentations_used, presentations_limit')
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Fetch presentations
  const { data: presentations, error } = await admin
    .from('presentations')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    presentations: presentations ?? [],
    presentationsUsed: client.presentations_used ?? 0,
    presentationsLimit: client.presentations_limit ?? 1,
  });
}
