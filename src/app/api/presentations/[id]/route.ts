import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get client record to verify ownership
  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Verify the presentation belongs to this client
  const { data: presentation, error: presError } = await admin
    .from('presentations')
    .select('id, client_id')
    .eq('id', id)
    .eq('client_id', client.id)
    .single();

  if (presError || !presentation) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
  }

  // Delete
  const { error: deleteError } = await admin
    .from('presentations')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
