import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { zernioConfigured } from "@/lib/zernio";
import { ensureZernioProfile } from "@/lib/zernio-profile";
import { sendOnboardingCompleteEmail } from "@/lib/email";
import { generatePostForClient } from "@/lib/generate-post-for-client";

export async function POST() {
  // Step 1: Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Step 2: Fetch client row
  const { data: client } = await admin
    .from("clients")
    .select("id, business_name, email")
    .eq("user_id", user.id)
    .single();

  // Step 3: 404 if no client
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Step 4: Set client status to active
  await admin
    .from("clients")
    .update({ status: "active" })
    .eq("id", client.id);

  // Step 5: Ensure the client has a Zernio profile (for connecting socials).
  if (zernioConfigured()) {
    try {
      await ensureZernioProfile(admin, client.id);
    } catch (zernioErr: unknown) {
      const msg = zernioErr instanceof Error ? zernioErr.message : String(zernioErr);
      console.error("[onboarding/complete] Zernio profile creation failed:", msg);
    }
  }

  // Step 6: Trigger first post generation
  try {
    await generatePostForClient(client.id);
  } catch (genErr: unknown) {
    const msg = genErr instanceof Error ? genErr.message : String(genErr);
    console.error("[onboarding/complete] Post generation failed:", msg);
  }

  // Step 7: Send onboarding complete email
  try {
    await sendOnboardingCompleteEmail({
      to: client.email,
      firstName: client.business_name.split(" ")[0],
      businessName: client.business_name,
    });
  } catch (emailErr: unknown) {
    const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
    console.error("[onboarding/complete] Email failed:", msg);
  }

  // Step 8: Insert welcome activity
  await admin.from("activities").insert({
    client_id: client.id,
    type: "onboarding",
    title: "Onboarding complete",
    description: "Account activated and first post is generating.",
    created_by: "system",
  } as never);

  // Step 9: Return success
  return NextResponse.json({ ok: true, businessName: client.business_name });
}
