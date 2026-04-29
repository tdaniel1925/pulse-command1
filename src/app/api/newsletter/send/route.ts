import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

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
  const { newsletterId } = body;

  if (!newsletterId) return NextResponse.json({ error: "newsletterId is required" }, { status: 400 });

  // Fetch newsletter + verify ownership
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", newsletterId)
    .eq("client_id", client.id)
    .single();

  if (!newsletter) return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });

  // Fetch active subscribers
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, first_name")
    .eq("client_id", client.id)
    .eq("status", "active");

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: false, error: "No subscribers" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM_EMAIL ?? "hello@bundledcontent.com";

  let successCount = 0;
  let failureCount = 0;

  // Send in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (sub) => {
        try {
          await resend.emails.send({
            from: FROM,
            to: sub.email,
            subject: newsletter.subject,
            html: newsletter.body_html ?? "",
          });
          successCount++;
        } catch {
          failureCount++;
        }
      })
    );
  }

  // Update newsletter status
  await supabase
    .from("newsletters")
    .update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: successCount })
    .eq("id", newsletterId);

  return NextResponse.json({ ok: true, sent: successCount, failed: failureCount });
}
