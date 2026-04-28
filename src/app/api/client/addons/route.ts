export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the client record for this user
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('client_addons')
    .select('*, addons(*)')
    .eq('client_id', client.id)
    .eq('status', 'active');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addons: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { addonKey } = await req.json();
  if (!addonKey) {
    return NextResponse.json({ error: 'addonKey is required' }, { status: 400 });
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Mark as pending (Stripe payment happens later)
  const { data, error } = await supabase
    .from('client_addons')
    .insert({ client_id: client.id, addon_key: addonKey, status: 'pending' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addon: data, message: 'Add-on requested. Our team will activate it shortly.' });
}
