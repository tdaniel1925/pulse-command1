import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from '@/components/dashboard/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: client, error } = await supabase
      .from('clients')
      .select(
        'id, business_name, email, status, metadata, ayrshare_profile_key, ayrshare_connected_platforms, plan_name, plan_status, presentations_used, presentations_limit'
      )
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('[SettingsPage] Supabase error:', error);
      redirect('/login');
    }

    if (!client) redirect('/login');

    return (
      <SettingsClient
        client={{
          id: client.id,
          business_name: client.business_name ?? null,
          email: client.email ?? null,
          status: client.status ?? null,
          metadata: client.metadata ?? {},
          ayrshare_profile_key: client.ayrshare_profile_key ?? null,
          ayrshare_connected_platforms: client.ayrshare_connected_platforms ?? null,
          plan_name: client.plan_name ?? null,
          plan_status: client.plan_status ?? null,
          presentations_used: client.presentations_used ?? 0,
          presentations_limit: client.presentations_limit ?? 0,
        }}
        userEmail={user.email ?? ''}
      />
    );
  } catch (error) {
    console.error('[SettingsPage] Error:', error);
    redirect('/dashboard');
  }
}
