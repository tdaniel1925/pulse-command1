export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id')
    .eq('status', 'active')
    .lte('next_delivery_at', new Date().toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  for (const client of clients ?? []) {
    fetch(`${baseUrl}/api/pipeline/deliver-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id }),
    }).catch((err) => console.error(`[monthly-delivery] Error triggering client ${client.id}:`, err));
  }

  return NextResponse.json({ triggered: clients?.length ?? 0 });
}
