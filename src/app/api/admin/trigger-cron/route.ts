import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/cron/weekly-social`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { error: json.error ?? `Cron responded with ${res.status}` },
      { status: res.status }
    );
  }

  return NextResponse.json(json);
}
