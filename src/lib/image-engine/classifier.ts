import { generateJSON, LIGHT_MODEL } from '@/lib/openrouter';
import { BRAND_VIBE_STYLES, IMAGE_ENGINE_CONFIG } from './config';
import type { ClassificationResult, BrandVibe, ImageType, InfographicStyle, PhotoStyle, LayoutTemplate, CompositionStyle } from './types';

// ─── Simple in-memory cache ──────────────────────────────────────────────────

const classifierCache = new Map<string, { result: ClassificationResult; expiresAt: number }>();

function getCacheKey(caption: string, hook: string, platform: string, brandVibe: BrandVibe): string {
  return `${caption.slice(0, 100)}|${hook.slice(0, 50)}|${platform}|${brandVibe}`;
}

// ─── Seeded fallback layout (cycles weekly per client, never repeats) ─────────

const LAYOUT_ROTATION: LayoutTemplate[] = [
  'hero_bottom_bar',
  'photo_mosaic',
  'split_panel',
  'vision_board',
  'stat_callout',
  'quote_card',
  'single_hero',
];

export function getSeededLayout(clientId: string, weekSeed: number): LayoutTemplate {
  // Hash clientId to a number so different clients don't always get the same layout
  let hash = weekSeed;
  for (let i = 0; i < clientId.length; i++) {
    hash = (hash * 31 + clientId.charCodeAt(i)) >>> 0;
  }
  return LAYOUT_ROTATION[hash % LAYOUT_ROTATION.length];
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
  clientId?: string;
  weekSeed?: number;
}): Promise<ClassificationResult> {

  // Check cache
  const cacheKey = getCacheKey(post.caption, post.hook, post.platform, post.brandVibe);
  const cached = classifierCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log('[Classifier] Cache hit');
    return cached.result;
  }

  const preferredStyles = BRAND_VIBE_STYLES[post.brandVibe];

  const prompt = `You are an expert social media art director. Analyze this post and decide the best image type, layout template, and composition style to generate.

POST DETAILS:
- Caption: "${post.caption}"
- Hook: "${post.hook}"
- CTA: "${post.cta}"
- Industry: ${post.industry}
- Brand vibe: ${post.brandVibe}
- Post type: ${post.postType}
- Platform: ${post.platform}

━━━ STEP 1: COMPOSITION (single vs collage) ━━━
- "single" = one dominant image/scene. Best for: announcements, quotes, hero messages, product showcases, one clear visual idea.
- "collage" = multiple photos or panels. Best for: stories, testimonials, multi-benefit posts, community, "look at what we do" posts.

Content signals → use "collage":
  - mentions multiple people, clients, or stories
  - lists multiple benefits or features
  - community/team/group topic
  - "vision board" / aspirational / dream-big energy

Content signals → use "single":
  - one strong headline or quote
  - one product or service highlight
  - announcement or launch
  - clean professional authority message

━━━ STEP 2: LAYOUT TEMPLATE ━━━
Choose ONE based on post content:

1. hero_bottom_bar — Full-bleed photo (professional person or scene), solid brand-color bar covering bottom 28%, bold white headline inside bar + subtitle. Logo top-left. Best for: professional authority, career, product/service launches, announcements.

2. photo_mosaic — Grid of 5-7 photos in a clean layout (not overlapping), white header bar at top with business name + headline, centered CTA button over photos. Best for: community, stories, multiple people, service variety, testimonials.

3. split_panel — Left 45% solid brand color with large bold headline + bullet benefits + CTA button, right 55% high-quality photo. Clean professional grid. Best for: feature lists, differentiators, "why choose us" topics.

4. vision_board — Cork board or mood board aesthetic with 5-8 photos pinned at angles, center card with main headline text + benefits + CTA button. Feels aspirational, busy, motivational. Best for: dream-big topics, motivational content, "what's possible" messaging.

5. stat_callout — Dark brand-color background, 2-3 large bold stat/benefit boxes (white text on dark), accent photo or icon, prominent headline. Best for: proof points, numbers, credentials, "no fees/no cuts" style messages.

6. quote_card — Solid background (brand color or gradient), large elegant centered pull-quote in high contrast, minimal design, small attribution line, subtle texture. Best for: tips, advice, inspirational quotes, thought leadership.

7. single_hero — One striking full-frame photo or illustration, text overlaid or in a clean bar. Simple, powerful, no collage. Best for: lifestyle, outdoor, wellness, clean minimalist brands.

━━━ STEP 3: IMAGE TYPE ━━━
1. photo_realistic — Real-looking photo of people, places, scenes
2. infographic — Data visualization, charts, comparisons, processes
3. text_graphic — Branded text card with strong typography
4. illustration — Stylized graphic, abstract concept
5. product_mockup — Product or service shown in context
6. mixed_text_visual — Photo background with text overlay

IF photo_realistic, pick one photo_style:
- popular_lifestyle: Authentic/relaxed/everyday. F&B, family, local biz, insurance
- minimalist_aesthetic: Quiet/refined/intentional. Luxury, wellness, premium
- creative_flat_lay: Curated/inventive/hands-on. Productivity, makers
- adventure_travel: Inspirational/expansive/free. Travel, fitness, outdoor
- neon_tech: Dynamic/futuristic/bold. AI/SaaS, cybersecurity, fintech
- urban_street: Energetic/culturally rich/modern. Streetwear, gen-Z, edgy

IF infographic, pick one infographic_style:
- isometric_3d: Complex/structured/modern. Tech, SaaS
- flat_vector: Accessible/professional/step-by-step. Business, education
- doodle_sketched: Approachable/creative. Agencies, coaching
- watercolor: Artistic/natural/gentle. Wellness, beauty, lifestyle
- neon_cyberpunk: Technical/future/bold. AI/tech
- minimalist: Clean/simple/direct. Finance, legal, luxury

PREFERRED STYLES FOR THIS BRAND:
- Infographic: ${preferredStyles.infographic.join(' or ')}
- Photo: ${preferredStyles.photo.join(' or ')}

PLATFORM GUIDANCE:
- instagram: hero_bottom_bar or photo_mosaic or vision_board
- linkedin: split_panel or stat_callout or hero_bottom_bar (clean/professional only)
- twitter: quote_card or stat_callout (must be readable at small size)
- facebook: any layout — photo_mosaic and vision_board perform well
- tiktok: single_hero or hero_bottom_bar with bold energy

Return ONLY valid JSON, no markdown:
{
  "composition": "single|collage",
  "layout": "<layout_template>",
  "primary_type": "<image_type>",
  "reasoning": "<2 sentence explanation of WHY this layout and composition fit this content>",
  "fallback_type": "<image_type>",
  "infographic_style": "<style or null>",
  "photo_style": "<style or null>"
}`;

  let result: ClassificationResult;
  try {
    const parsed = await generateJSON<{
      composition: string;
      layout: string;
      primary_type: string;
      reasoning: string;
      fallback_type: string;
      infographic_style?: string;
      photo_style?: string;
    }>({
      model: LIGHT_MODEL,
      maxTokens: 400,
      prompt,
    });

    // Validate layout is a known value
    const validLayouts: LayoutTemplate[] = ['hero_bottom_bar', 'vision_board', 'photo_mosaic', 'split_panel', 'quote_card', 'stat_callout', 'single_hero'];
    const layout: LayoutTemplate = validLayouts.includes(parsed.layout as LayoutTemplate) ? parsed.layout as LayoutTemplate : (
      post.clientId && post.weekSeed !== undefined
        ? getSeededLayout(post.clientId, post.weekSeed)
        : 'hero_bottom_bar'
    );

    result = {
      primary_type: parsed.primary_type as ImageType,
      layout,
      composition: (parsed.composition === 'collage' ? 'collage' : 'single') as CompositionStyle,
      reasoning: parsed.reasoning,
      fallback_type: parsed.fallback_type as ImageType,
      infographic_style: (parsed.infographic_style ?? undefined) as InfographicStyle | undefined,
      photo_style: (parsed.photo_style ?? undefined) as PhotoStyle | undefined,
    };
  } catch {
    console.error('[Classifier] Failed to parse JSON, using fallback');
    const fallbackLayout = post.clientId && post.weekSeed !== undefined
      ? getSeededLayout(post.clientId, post.weekSeed)
      : 'hero_bottom_bar';
    result = {
      primary_type: 'photo_realistic',
      layout: fallbackLayout,
      composition: 'single',
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
