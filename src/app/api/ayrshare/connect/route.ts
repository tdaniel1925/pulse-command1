import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAyrshareJWT, createAyrshareProfile } from '@/lib/ayrshare';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id, ayrshare_profile_key, business_name, email')
      .eq('user_id', user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If no profile key exists, create one
    let profileKey = client.ayrshare_profile_key;
    if (!profileKey) {
      const { profileKey: newProfileKey } = await createAyrshareProfile({
        title: client.business_name || 'BundledContent Client',
        email: client.email || undefined,
      });
      profileKey = newProfileKey;

      // Save the profile key to database
      await supabase
        .from('clients')
        .update({ ayrshare_profile_key: profileKey })
        .eq('id', client.id);
    }

    const url = await generateAyrshareJWT(profileKey);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('[/api/ayrshare/connect]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate connection URL' },
      { status: 500 }
    );
  }
}
