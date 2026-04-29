import Anthropic from '@anthropic-ai/sdk';
import { BRAND_VIBE_STYLES, IMAGE_ENGINE_CONFIG } from './config';
import type { ClassificationResult, BrandVibe, ImageType, InfographicStyle, PhotoStyle } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Simple in-memory cache ──────────────────────────────────────────────────

const classifierCache = new Map<string, { result: ClassificationResult; expiresAt: number }>();

function getCacheKey(caption: string, hook: string, platform: string, brandVibe: BrandVibe): string {
  return `${caption.slice(0, 100)}|${hook.slice(0, 50)}|${platform}|${brandVibe}`;
}

// ─── Classifier ──────────────────────────────────────────────────────────────

export async function classifyImageType(post: {
  caption: string;
  hook: string;
  cta: string;
  industry: string;
  brandVibe: BrandVibe;
  postType: string;
  platform: string;
}): Promise<ClassificationResult> {

  // Check cache
  const cacheKey = getCacheKey(post.caption, post.hook, post.platform, post.brandVibe);
  const cached = classifierCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log('[Classifier] Cache hit');
    return cached.result;
  }

  const preferredStyles = BRAND_VIBE_STYLES[post.brandVibe];

  const prompt = `You are an expert social media art director. Analyze this post and decide the best image type and sub-style to generate.

POST DETAILS:
- Caption: "${post.caption}"
- Hook: "${post.hook}"
- CTA: "${post.cta}"
- Industry: ${post.industry}
- Brand vibe: ${post.brandVibe}
- Post type: ${post.postType}
- Platform: ${post.platform}

IMAGE TYPE OPTIONS:
1. photo_realistic — Real-looking photo of people, places, scenes
2. infographic — Data visualization, charts, comparisons, processes
3. text_graphic — Branded text card with strong typography
4. illustration — Stylized graphic, abstract concept, icon-style
5. product_mockup — Product or service shown in context
6. mixed_text_visual — Photo/illustration background with text overlay

IF photo_realistic, pick one photo_style:
- popular_lifestyle: Authentic/relaxed/everyday. F&B, family, local biz, insurance
- minimalist_aesthetic: Quiet/refined/intentional. Luxury, wellness, premium
- creative_flat_lay: Curated/inventive/hands-on. Productivity, makers, designers
- adventure_travel: Inspirational/expansive/free. Travel, fitness, outdoor
- neon_tech: Dynamic/futuristic/bold. AI/SaaS, cybersecurity, fintech
- urban_street: Energetic/culturally rich/modern. Streetwear, gen-Z, edgy creative

IF infographic, pick one infographic_style:
- isometric_3d: Complex/structured/modern. Tech, SaaS, engineering
- flat_vector: Accessible/professional/step-by-step. Business, education, healthcare
- doodle_sketched: Approachable/creative/brainstorm. Agencies, coaching, casual brands
- watercolor: Artistic/natural/gentle. Wellness, beauty, parenting, lifestyle
- neon_cyberpunk: Technical/future/bold. AI/tech, crypto, gaming
- minimalist: Clean/simple/direct. Finance, legal, luxury, premium

PREFERRED STYLES FOR THIS BRAND:
- Infographic: ${preferredStyles.infographic.join(' or ')}
- Photo: ${preferredStyles.photo.join(' or ')}
Prioritize these unless post content strongly suggests otherwise.

PLATFORM GUIDANCE:
- instagram: photo_realistic or mixed_text_visual
- linkedin: infographic or text_graphic (avoid neon/urban)
- twitter: text_graphic or mixed_text_visual (must be readable at small size)
- facebook: photo_realistic or mixed_text_visual
- tiktok: photo_realistic with bold styles
- pinterest: infographic or mixed_text_visual

Return ONLY valid JSON, no markdown:
{
  "primary_type": "<image_type>",
  "reasoning": "<2 sentence explanation>",
  "fallback_type": "<image_type>",
  "infographic_style": "<style or null>",
  "photo_style": "<style or null>"
}`;

  const response = await anthropic.messages.create({
    model: IMAGE_ENGINE_CONFIG.classifier.model,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  let result: ClassificationResult;
  try {
    const parsed = JSON.parse(text.trim());
    result = {
      primary_type: parsed.primary_type as ImageType,
      reasoning: parsed.reasoning,
      fallback_type: parsed.fallback_type as ImageType,
      infographic_style: parsed.infographic_style ?? undefined,
      photo_style: parsed.photo_style ?? undefined,
    };
  } catch {
    console.error('[Classifier] Failed to parse JSON, using fallback');
    result = {
      primary_type: 'photo_realistic',
      reasoning: 'Fallback: JSON parse failed',
      fallback_type: 'text_graphic',
      photo_style: preferredStyles.photo[0] as PhotoStyle,
    };
  }

  // Cache result
  classifierCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + IMAGE_ENGINE_CONFIG.classifier.cache_ttl_seconds * 1000,
  });

  return result;
}
