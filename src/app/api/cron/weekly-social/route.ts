import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";
import { generateSocialPostImage } from "@/lib/image-engine/orchestrator";
import type { BrandContext, BrandVibe, ClientTier } from "@/lib/image-engine/types";

const CRON_SECRET = process.env.CRON_SECRET!;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Weekly topics ───────────────────────────────────────────────────────────

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

// ─── Claude caption generator ─────────────────────────────────────────────────

type PlatformCaptions = {
  instagram: string;
  linkedin: string;
  facebook: string;
  twitter: string;
};

async function generateCaptions(params: {
  topic: string;
  businessName: string;
  businessDescription: string;
  toneOfVoice: string;
  targetAudience: string;
  website: string;
}): Promise<PlatformCaptions> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    messages: [{
      role: "user",
      content: `You are a social media expert. Write platform-specific captions for this business.

BUSINESS: ${params.businessName}
WEBSITE: ${params.website}
DESCRIPTION: ${params.businessDescription}
TONE: ${params.toneOfVoice}
AUDIENCE: ${params.targetAudience}
TOPIC: ${params.topic}

Write 4 captions — one per platform. Each must be tailored to that platform's style and character limits.

INSTAGRAM: Engaging, conversational, 3-5 relevant hashtags, up to 300 chars before hashtags. Emoji ok.
LINKEDIN: Professional, insightful, no hashtags, 150-200 chars. No emoji.
FACEBOOK: Friendly and conversational, 100-150 chars, 1-2 hashtags max.
TWITTER: Punchy and direct, under 240 chars, 1-2 hashtags.

Return ONLY valid JSON:
{
  "instagram": "...",
  "linkedin": "...",
  "facebook": "...",
  "twitter": "..."
}`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "{}";
  try {
    return JSON.parse(text) as PlatformCaptions;
  } catch {
    const fallback = `${params.topic} — ${params.businessName}. ${params.website}`;
    return { instagram: fallback, linkedin: fallback, facebook: fallback, twitter: fallback };
  }
}

// ─── Cron handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const weekTopic = getWeekTopic();
  const monthBatch = new Date().toISOString().slice(0, 7);

  console.log(`[weekly-social] Topic: "${weekTopic}"`);

  // Fetch active clients
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, business_name, website, brand_vibe")
    .eq("status", "active");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!clients?.length) return NextResponse.json({ ok: true, message: "No active clients" });

  // Fetch brand profiles
  const clientIds = clients.map((c) => c.id);
  const { data: brandProfiles } = await supabase
    .from("brand_profiles")
    .select("client_id, primary_color, secondary_color, logo_url, priority_channels, business_description, tone_of_voice, target_audience, brand_vibe")
    .in("client_id", clientIds);

  const bpMap = new Map((brandProfiles ?? []).map((bp) => [bp.client_id, bp]));

  let generated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const client of clients) {
    try {
      const bp = bpMap.get(client.id);
      const platforms: string[] = (bp?.priority_channels as string[]) ?? ["instagram", "facebook", "linkedin"];
      const primaryPlatform = platforms[0] ?? "instagram";

      const brandVibe = (bp?.brand_vibe ?? client.brand_vibe ?? "professional_warm") as BrandVibe;
      const businessDescription = bp?.business_description ?? "";
      const toneOfVoice = bp?.tone_of_voice ?? "professional";
      const targetAudience = bp?.target_audience ?? "general audience";
      const primaryColor = bp?.primary_color ?? "#1a1a2e";
      const secondaryColor = bp?.secondary_color ?? "#4ade80";

      // Step 1: Generate captions for all platforms
      const captions = await generateCaptions({
        topic: weekTopic,
        businessName: client.business_name ?? "Our Business",
        businessDescription,
        toneOfVoice,
        targetAudience,
        website: client.website ?? "",
      });

      // Step 2: Build brand context for image engine
      const brand: BrandContext = {
        clientId: client.id,
        businessName: client.business_name ?? "Our Business",
        industry: businessDescription.slice(0, 80),
        website: client.website ?? "",
        vibe: brandVibe,
        colors: `primary: ${primaryColor}, secondary: ${secondaryColor}`,
        voice: toneOfVoice,
        audience: targetAudience,
        description: businessDescription,
        logoUrl: bp?.logo_url ?? undefined,
      };

      // Step 3: Generate image for the primary platform
      const imageResult = await generateSocialPostImage({
        post: {
          id: `${client.id}-${Date.now()}`,
          caption: captions[primaryPlatform as keyof PlatformCaptions] ?? captions.instagram,
          hook: weekTopic,
          cta: `Learn more at ${client.website ?? "our website"}`,
          platform: primaryPlatform,
          postType: "weekly_social",
        },
        brand,
        platform: primaryPlatform,
        clientTier: "starter" as ClientTier,
      });

      // Step 4: Check auto_approve
      const { data: clientRow } = await supabase
        .from("clients")
        .select("auto_approve")
        .eq("id", client.id)
        .single();
      const autoApprove = clientRow?.auto_approve ?? true;
      const postStatus = autoApprove ? "scheduled" : "pending_approval";

      // Step 5: Insert one social post row with all platform captions
      const { data: insertedPost } = await supabase.from("social_posts").insert({
        client_id: client.id,
        content: captions[primaryPlatform as keyof PlatformCaptions] ?? captions.instagram,
        platforms,
        status: postStatus,
        month_batch: monthBatch,
        image_url: imageResult.imageUrl,
        metadata: {
          topic: weekTopic,
          captions,
          image_type: imageResult.imageType,
          layout: imageResult.layout,
          composition: imageResult.composition,
          photo_style: imageResult.photoStyle,
          infographic_style: imageResult.infographicStyle,
          generation_cost: imageResult.generationCost,
        },
      } as never).select("id").single();

      // Step 6: Auto-publish via Ayrshare if client has profile key and auto_approve is on
      if (autoApprove && insertedPost?.id) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("ayrshare_profile_key")
          .eq("id", client.id)
          .single();

        if (clientData?.ayrshare_profile_key) {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
            await fetch(`${baseUrl}/api/ayrshare/publish`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postId: insertedPost.id }),
            });
            console.log(`[weekly-social] ✓ Published to Ayrshare: ${client.business_name}`);
          } catch (publishErr: any) {
            console.error(`[weekly-social] Ayrshare publish failed for ${client.business_name}:`, publishErr.message);
          }
        }
      }

      // Step 7: Log activity
      await supabase.from("activities").insert({
        client_id: client.id,
        type: "post",
        title: autoApprove ? "Social post scheduled" : "Social post ready for approval",
        description: `Weekly post: "${weekTopic}" — ${imageResult.imageType} image generated.`,
        created_by: "system",
      } as never);

      generated++;
      console.log(
        `[weekly-social] ✓ ${client.business_name} | ${imageResult.imageType}` +
        (imageResult.photoStyle ? ` (${imageResult.photoStyle})` : "") +
        (imageResult.infographicStyle ? ` (${imageResult.infographicStyle})` : "") +
        ` | $${imageResult.generationCost.toFixed(4)} | ${postStatus}`
      );

      // Small delay between clients to avoid rate limits
      await new Promise((r) => setTimeout(r, 1000));

    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.error(`[weekly-social] ✗ ${client.business_name}:`, msg);
      errors.push(`${client.business_name}: ${msg}`);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, topic: weekTopic, generated, failed, total: clients.length, errors });
}
