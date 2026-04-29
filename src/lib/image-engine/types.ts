// ─── Image Types ────────────────────────────────────────────────────────────

export type ImageType =
  | 'photo_realistic'
  | 'infographic'
  | 'text_graphic'
  | 'illustration'
  | 'product_mockup'
  | 'mixed_text_visual';

export type InfographicStyle =
  | 'isometric_3d'
  | 'flat_vector'
  | 'doodle_sketched'
  | 'watercolor'
  | 'neon_cyberpunk'
  | 'minimalist';

export type PhotoStyle =
  | 'popular_lifestyle'
  | 'minimalist_aesthetic'
  | 'creative_flat_lay'
  | 'adventure_travel'
  | 'neon_tech'
  | 'urban_street';

export type BrandVibe =
  | 'premium_serious'
  | 'professional_warm'
  | 'creative_playful'
  | 'tech_forward'
  | 'lifestyle_wellness'
  | 'edgy_modern'
  | 'outdoor_adventure';

export type GeminiModel =
  | 'nano_banana_2'
  | 'nano_banana_pro';

export type ClientTier =
  | 'starter'
  | 'professional'
  | 'premium'
  | 'agency';

// ─── Layout Templates ────────────────────────────────────────────────────────

export type LayoutTemplate =
  | 'hero_bottom_bar'     // Full bleed photo + solid color bar bottom 28% with bold headline
  | 'vision_board'        // Cork/mood board with pinned photos + center text card
  | 'photo_mosaic'        // 5-photo grid + white header bar + centered CTA button
  | 'split_panel'         // Left half solid color + right half photo, headline on color side
  | 'quote_card'          // Full color background, large centered pull-quote, minimal
  | 'stat_callout'        // Dark background, 2-3 large stats/benefits in boxes, photo accent
  | 'single_hero';        // Single striking image, text overlaid or below, no collage

export type CompositionStyle = 'single' | 'collage';

// ─── Classification ──────────────────────────────────────────────────────────

export type ClassificationResult = {
  primary_type: ImageType;
  layout: LayoutTemplate;
  composition: CompositionStyle;
  reasoning: string;
  fallback_type: ImageType;
  infographic_style?: InfographicStyle;
  photo_style?: PhotoStyle;
};

// ─── Context Types ───────────────────────────────────────────────────────────

export type PostContext = {
  id: string;
  caption: string;
  hook: string;
  cta: string;
  platform: string;
  postType: string;
  subtext?: string;
  dataPoints?: string;
  metaphor?: string;
  backgroundConcept?: string;
};

export type BrandContext = {
  clientId: string;
  businessName: string;
  industry: string;
  website: string;
  vibe: BrandVibe;
  colors: string;           // e.g. "primary: #1a1a2e, secondary: #4ade80"
  voice: string;            // tone_of_voice from brand_profiles
  audience: string;         // target_audience from brand_profiles
  description: string;      // business_description
  logoUrl?: string;
  product?: string;
  productType?: string;
  illustrationStyle?: string;
  visualStyle?: string;
  referenceImages?: Buffer[];
};

export type PlatformSpec = {
  platform: string;
  width: number;
  height: number;
  aspect_ratio: '1:1' | '4:5' | '9:16' | '16:9' | '3:4';
  max_file_size_kb: number;
};

// ─── Generation Result ───────────────────────────────────────────────────────

export type ImageGenerationResult = {
  imageUrl: string;
  imageType: ImageType;
  layout: LayoutTemplate;
  composition: CompositionStyle;
  infographicStyle?: InfographicStyle;
  photoStyle?: PhotoStyle;
  classifierReasoning: string;
  geminiModel: GeminiModel;
  generationCost: number;
  generationTimeMs: number;
};

export type GenerationLogEntry = {
  postId: string;
  clientId: string;
  imageType: ImageType;
  infographicStyle?: InfographicStyle;
  photoStyle?: PhotoStyle;
  classifierReasoning: string;
  geminiModel: GeminiModel;
  promptUsed: string;
  imageUrl: string;
  imageDimensions?: { width: number; height: number };
  costUsd: number;
  generationTimeMs: number;
  attempts: number;
};
