import type { BrandVibe, InfographicStyle, PhotoStyle, PlatformSpec, GeminiModel, ImageType } from './types';
export type { ImageType };

// ─── Gemini Model IDs ────────────────────────────────────────────────────────

export const GEMINI_MODELS: Record<GeminiModel, string> = {
  nano_banana_2:   'gemini-2.5-flash-image',
  nano_banana_pro: 'gemini-3.1-flash-image-preview',
};

// ─── Brand Vibe → Preferred Styles ──────────────────────────────────────────

export const BRAND_VIBE_STYLES: Record<BrandVibe, {
  infographic: InfographicStyle[];
  photo: PhotoStyle[];
}> = {
  premium_serious: {
    infographic: ['minimalist', 'flat_vector'],
    photo: ['minimalist_aesthetic', 'popular_lifestyle'],
  },
  professional_warm: {
    infographic: ['flat_vector', 'watercolor'],
    photo: ['popular_lifestyle', 'minimalist_aesthetic'],
  },
  creative_playful: {
    infographic: ['doodle_sketched', 'watercolor'],
    photo: ['creative_flat_lay', 'popular_lifestyle'],
  },
  tech_forward: {
    infographic: ['isometric_3d', 'neon_cyberpunk'],
    photo: ['neon_tech', 'minimalist_aesthetic'],
  },
  lifestyle_wellness: {
    infographic: ['watercolor', 'doodle_sketched'],
    photo: ['popular_lifestyle', 'minimalist_aesthetic'],
  },
  edgy_modern: {
    infographic: ['neon_cyberpunk', 'isometric_3d'],
    photo: ['urban_street', 'neon_tech'],
  },
  outdoor_adventure: {
    infographic: ['flat_vector', 'watercolor'],
    photo: ['adventure_travel', 'popular_lifestyle'],
  },
};

// ─── Platform Specs ──────────────────────────────────────────────────────────

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  instagram:  { platform: 'instagram',  width: 1080, height: 1080, aspect_ratio: '1:1',  max_file_size_kb: 8000 },
  facebook:   { platform: 'facebook',   width: 1200, height: 630,  aspect_ratio: '16:9', max_file_size_kb: 8000 },
  linkedin:   { platform: 'linkedin',   width: 1200, height: 627,  aspect_ratio: '16:9', max_file_size_kb: 5000 },
  twitter:    { platform: 'twitter',    width: 1600, height: 900,  aspect_ratio: '16:9', max_file_size_kb: 5000 },
  tiktok:     { platform: 'tiktok',     width: 1080, height: 1920, aspect_ratio: '9:16', max_file_size_kb: 8000 },
  pinterest:  { platform: 'pinterest',  width: 1000, height: 1500, aspect_ratio: '3:4',  max_file_size_kb: 10000 },
  default:    { platform: 'default',    width: 1080, height: 1080, aspect_ratio: '1:1',  max_file_size_kb: 8000 },
};

// ─── Cost Estimates (USD) ────────────────────────────────────────────────────

export const COST_ESTIMATES: Record<GeminiModel, number> = {
  nano_banana_2:   0.04,
  nano_banana_pro: 0.08,
};

export const CLAUDE_COST_ESTIMATES = {
  classifier:       0.001,   // Haiku
  prompt_generator: 0.01,    // Sonnet
};

// ─── Model Selection Rules ───────────────────────────────────────────────────

// Types that ALWAYS use Pro (text accuracy critical)
export const PRO_REQUIRED_TYPES: ImageType[] = [
  'infographic',
  'text_graphic',
  'mixed_text_visual',
];

// ─── Engine Config ───────────────────────────────────────────────────────────

export const IMAGE_ENGINE_CONFIG = {
  classifier: {
    model: 'claude-haiku-4-5-20251001' as const,
    cache_ttl_seconds: 86400,
  },
  prompt_generator: {
    model: 'claude-sonnet-4-6' as const,
    max_tokens: 600,
  },
  gemini: {
    timeout_ms: 45000,
    max_retries: 3,
  },
  fallbacks: {
    enabled: true,
  },
  cost_tracking: {
    log_every_generation: true,
    alert_threshold_usd: 100,
  },
  storage: {
    bucket: 'social-images',
  },
};
