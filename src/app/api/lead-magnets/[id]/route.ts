import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  // Verify ownership
  const { data: existing } = await supabase
    .from("lead_magnets")
    .select("id, client_id")
    .eq("id", id)
    .eq("client_id", client.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("lead_magnets")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
