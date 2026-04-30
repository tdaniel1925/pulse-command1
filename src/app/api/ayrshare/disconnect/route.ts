import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    await supabase
      .from('clients')
      .update({ ayrshare_profile_key: null, ayrshare_connected_platforms: null })
      .eq('id', client.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[ayrshare/disconnect]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
