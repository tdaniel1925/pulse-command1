import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PREDIS_API_KEY = process.env.PREDIS_API_KEY!;
const PREDIS_BRAND_ID = process.env.PREDIS_BRAND_ID!;
const CRON_SECRET = process.env.CRON_SECRET!;

// Topics to rotate through weekly — AI picks which fits the brand
const POST_TOPICS = [
  "Why customers choose us over the competition",
  "A tip your customers need to know this week",
  "Behind the scenes at our business",
  "A common mistake our customers make and how to avoid it",
  "A client success story that shows our results",
  "What makes our service different from everyone else",
  "A question we get asked all the time — answered",
  "The #1 reason businesses like yours need this now",
];

function getWeekTopic(): string {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return POST_TOPICS[weekNumber % POST_TOPICS.length];
}

async function generatePredisPost(params: {
  topic: string;
  businessName: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  handle: string;
  mediaType: "single_image" | "carousel";
}): Promise<string | null> {
  const brandDetails = JSON.stringify({
    color_1: params.primaryColor?.replace("#", "") || "1AABCF",
    color_2: params.secondaryColor?.replace("#", "") || "F5873A",
    brand_website: params.website || "",
    brand_handle: params.handle || "",
    logo_url: params.logoUrl || "",
  });

  const text = `${params.topic} — ${params.businessName}`;

  const formData = new FormData();
  formData.append("brand_id", PREDIS_BRAND_ID);
  formData.append("text", text);
  formData.append("media_type", params.mediaType);
  formData.append("model_version", "4");
  formData.append("n_posts", "1");
  formData.append("brand_details", brandDetails);

  const res = await fetch("https://brain.predis.ai/predis_api/v1/create_content/", {
    method: "POST",
    headers: { Authorization: PREDIS_API_KEY },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[predis] create_content failed:`, err);
    return null;
  }

  const data = await res.json();
  const postId = data.post_id ?? data.posts?.[0]?.post_id;
  return postId ?? null;
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const weekTopic = getWeekTopic();
  const monthBatch = new Date().toISOString().slice(0, 7); // "2025-04"

  console.log(`[weekly-social] Running for week topic: "${weekTopic}"`);

  // Get all active clients with their brand profiles
  const { data: clients, error } = await supabase
    .from("clients")
    .select(`
      id, business_name, website,
      brand_profiles (
        primary_color, secondary_color, logo_url, priority_channels
      )
    `)
    .eq("status", "active");

  if (error) {
    console.error("[weekly-social] Failed to fetch clients:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!clients?.length) {
    return NextResponse.json({ ok: true, message: "No active clients" });
  }

  let generated = 0;
  let failed = 0;

  for (const client of clients) {
    try {
      const bp = Array.isArray(client.brand_profiles)
        ? client.brand_profiles[0]
        : client.brand_profiles;

      const handle = `@${(client.business_name ?? "brand").toLowerCase().replace(/\s+/g, "")}`;

      // Generate image post
      const postId = await generatePredisPost({
        topic: weekTopic,
        businessName: client.business_name ?? "Our Business",
        website: client.website ?? "",
        primaryColor: bp?.primary_color ?? "#1AABCF",
        secondaryColor: bp?.secondary_color ?? "#F5873A",
        logoUrl: bp?.logo_url ?? "",
        handle,
        mediaType: "single_image",
      });

      if (!postId) {
        failed++;
        continue;
      }

      // Insert a placeholder row — webhook will fill image_url + caption when done
      const platforms = (bp?.priority_channels as string[]) ?? ["instagram", "facebook", "linkedin"];

      await supabase.from("social_posts").insert({
        client_id: client.id,
        content: `[Generating] ${weekTopic}`, // webhook will update this
        platforms,
        status: "draft", // webhook upgrades to pending_approval
        month_batch: monthBatch,
        metadata: { predis_post_id: postId, topic: weekTopic },
      } as never);

      generated++;
      console.log(`[weekly-social] Queued post for ${client.business_name} — predis_post_id: ${postId}`);

      // Predis allows max 3 in-progress — small delay between clients
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[weekly-social] Error for client ${client.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    topic: weekTopic,
    generated,
    failed,
    total: clients.length,
  });
}
