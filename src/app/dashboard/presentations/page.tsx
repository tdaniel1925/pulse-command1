import { createClient } from "@/lib/supabase/server";
import { PresentationsList } from "@/components/dashboard/PresentationsList";

export default async function PresentationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id, presentations_used, presentations_limit")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: presentations } = await supabase
    .from("presentations")
    .select("id, title, topic, status, slide_count, thumbnail_url, created_at")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <PresentationsList
      presentations={presentations ?? []}
      presentationsUsed={client?.presentations_used ?? 0}
      presentationsLimit={client?.presentations_limit ?? 1}
      clientId={client?.id ?? ""}
    />
  );
}
