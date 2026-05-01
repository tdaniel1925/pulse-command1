import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from '@/components/dashboard/SettingsClient';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!client) {
    return null;
  }

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
}
