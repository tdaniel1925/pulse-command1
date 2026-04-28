import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddonsGrid } from '@/components/dashboard/AddonsGrid';

export default async function AddonsPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch client
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user?.id)
    .single();

  // Fetch all active add-ons from catalog
  const { data: allAddons } = await adminClient
    .from('addons')
    .select('id, key, name, description, price_cents, billing_type, stripe_price_id')
    .eq('active', true)
    .order('price_cents');

  // Fetch client's active add-ons
  const { data: clientAddons } = await adminClient
    .from('client_addons')
    .select('addon_key')
    .eq('client_id', client?.id ?? '')
    .eq('status', 'active');

  const activeKeys = new Set((clientAddons ?? []).map((a: { addon_key: string }) => a.addon_key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Add-ons</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Supercharge your content package with powerful add-ons.
        </p>
      </div>

      <AddonsGrid
        addons={(allAddons ?? []).map((addon) => ({
          ...addon,
          isActive: activeKeys.has(addon.key),
        }))}
      />
    </div>
  );
}
