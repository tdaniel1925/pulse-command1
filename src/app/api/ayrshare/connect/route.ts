import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAyrshareProfile, generateAyrshareJWT } from '@/lib/ayrshare';

// GET — returns the JWT link for the client to connect their social accounts
export async function GET() {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: client } = await supabase
      .from('clients')
      .select('id, business_name, email, ayrshare_profile_key')
      .eq('user_id', user.id)
      .single();

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    let profileKey = client.ayrshare_profile_key;

    // Create Ayrshare profile if not yet created
    if (!profileKey) {
      const profile = await createAyrshareProfile({
        title: client.business_name ?? user.email ?? 'Client',
        email: client.email ?? user.email,
      });
      profileKey = profile.profileKey;

      await admin
        .from('clients')
        .update({ ayrshare_profile_key: profileKey })
        .eq('id', client.id);
    }

    // Generate the JWT link
    const url = await generateAyrshareJWT(profileKey);

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[ayrshare/connect]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
