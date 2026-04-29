import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("lead_magnets")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const body = await request.json();
  const { title, description, file_url, landing_page_url, status } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("lead_magnets")
    .insert({ client_id: client.id, title, description, file_url, landing_page_url, status: status ?? "draft" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
