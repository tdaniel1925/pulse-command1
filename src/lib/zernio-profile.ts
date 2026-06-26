import { createZernioProfile } from '@/lib/zernio'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Resolve a client's Zernio profile id, creating the profile on first use.
 * Resilient to the `zernio_profile_id` migration not having been run yet: if the
 * column is missing, the select/update fail softly and we return whatever we can
 * (a freshly created profile id that just won't persist until the migration runs).
 */
export async function ensureZernioProfile(
  admin: SupabaseClient,
  clientId: string,
): Promise<string | null> {
  // Try to read an existing profile id (column may not exist yet).
  let existing: string | null = null
  let businessName = 'Client'
  try {
    const { data } = await admin
      .from('clients')
      .select('zernio_profile_id, business_name')
      .eq('id', clientId)
      .single()
    existing = (data?.zernio_profile_id as string | null) ?? null
    businessName = (data?.business_name as string | null) ?? businessName
  } catch {
    // column missing — fall through and create a profile
    try {
      const { data } = await admin.from('clients').select('business_name').eq('id', clientId).single()
      businessName = (data?.business_name as string | null) ?? businessName
    } catch { /* ignore */ }
  }

  if (existing) return existing

  // Create a new Zernio profile and try to persist it.
  const { id } = await createZernioProfile({ name: businessName })
  try {
    await admin.from('clients').update({ zernio_profile_id: id }).eq('id', clientId)
  } catch {
    // column missing — profile still usable for this request; persistence waits
    // on the migration. Surfaced to the operator via logs.
    console.warn('[zernio] could not persist zernio_profile_id (run the zernio.sql migration)')
  }
  return id
}
