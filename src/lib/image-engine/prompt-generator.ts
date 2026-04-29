import Anthropic from '@anthropic-ai/sdk';
import { IMAGE_ENGINE_CONFIG } from './config';
import type { ImageType, InfographicStyle, PhotoStyle, PostContext, BrandContext } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: IMAGE_ENGINE_CONFIG.prompt_generator.model,
    max_tokens: IMAGE_ENGINE_CONFIG.prompt_generator.max_tokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}

// ─── Master Router ───────────────────────────────────────────────────────────

export async function generateImagePrompt(
  imageType: ImageType,
  post: PostContext,
  brand: BrandContext,
  subStyle?: InfographicStyle | PhotoStyle
): Promise<string> {
  switch (imageType) {
    case 'photo_realistic':
      return buildPhotoRealisticPrompt(post, brand, subStyle as PhotoStyle);
    case 'infographic':
      return buildInfographicPrompt(post, brand, subStyle as InfographicStyle);
    case 'text_graphic':
      return buildTextGraphicPrompt(post, brand);
    case 'illustration':
      return buildIllustrationPrompt(post, brand);
    case 'product_mockup':
      return buildProductMockupPrompt(post, brand);
    case 'mixed_text_visual':
      return buildMixedTextVisualPrompt(post, brand);
  }
}

// ─── Photo Realistic ─────────────────────────────────────────────────────────

const PHOTO_STYLE_SPECS: Record<PhotoStyle, { description: string; guidance: string; lighting: string; colorTreatment: string }> = {
  popular_lifestyle: {
    description: 'Authentic, candid lifestyle photography with warm everyday energy',
    guidance: 'Real-looking human subject in everyday setting (coffee shop, home, casual outdoor). Genuine expression, relaxed body language. Warm color grading. Soft natural window light or golden hour. Slightly shallow depth of field. Authentic styling, NOT polished stock photo. Subject holding something relevant (coffee, book, device).',
    lighting: 'Soft natural daylight or warm interior light',
    colorTreatment: 'Warm earth tones, amber, soft browns. Brand colors as subtle accents.',
  },
  minimalist_aesthetic: {
    description: 'Clean, refined, magazine-quality minimalist photography',
    guidance: 'Single focal subject (object, plant, hand). Extensive negative space (60-70% of frame). Neutral background (white, soft beige, light gray). Soft directional natural light. Geometric composition. Subject small in frame. Restrained color palette (2-3 muted tones max).',
    lighting: 'Soft natural daylight from single direction, gentle shadows',
    colorTreatment: 'Neutrals + ONE muted brand accent color used sparingly',
  },
  creative_flat_lay: {
    description: 'Top-down arranged composition of objects on a textured surface',
    guidance: 'Direct overhead birds-eye view (90-degree). Textured surface as base (rustic wood, marble, linen). 5-8 carefully arranged objects relevant to the post. Negative space between objects (not cluttered). One hero object central. Soft even lighting. Brand-relevant props.',
    lighting: 'Even soft daylight from above, minimal shadows',
    colorTreatment: 'Warm wood or neutral surface + brand colors via objects',
  },
  adventure_travel: {
    description: 'Cinematic wide-angle landscape with subjects in epic environment',
    guidance: 'Wide composition showing expansive environment. Human subject(s) shown from behind, looking out. Epic landscape: mountains, coastline, forest, sunrise/sunset. Golden or blue hour light. Subjects appear small relative to environment (emphasizing scale). Outdoor gear styling. Atmospheric depth.',
    lighting: 'Golden hour, sunrise, sunset, or atmospheric blue hour',
    colorTreatment: 'Warm sunset oranges/pinks OR cool blue-hour purples/teals',
  },
  neon_tech: {
    description: 'Futuristic photography with glowing tech elements',
    guidance: 'Dark background (deep purple, navy, near-black). Subject interacting with futuristic tech (hand near hologram, floating UI elements, glowing interfaces). Neon accent lighting (cyan, magenta, electric blue). Subtle circuit patterns in background. Glowing edges and light bloom. Subject face or hand lit by tech glow.',
    lighting: 'Dramatic neon-glow rim lighting, dark ambient base',
    colorTreatment: 'Dark base + neon cyan/magenta/purple accents',
  },
  urban_street: {
    description: 'Gritty urban photography with cultural texture',
    guidance: 'Urban environment backdrop (graffiti walls, alleyways, brick, industrial). Subject in modern streetwear or fashion-forward outfit. Dynamic poses (crouching, leaning, walking). Natural city lighting. Rich textures (peeling paint, concrete, metal). Bold color contrast between subject and environment. Authentic lived-in urban feel.',
    lighting: 'Natural urban light — overcast, dappled, or dramatic shadow play',
    colorTreatment: 'Rich urban tones — concrete grays, graffiti pops of color, deep shadows',
  },
};

async function buildPhotoRealisticPrompt(post: PostContext, brand: BrandContext, style: PhotoStyle): Promise<string> {
  const spec = PHOTO_STYLE_SPECS[style] ?? PHOTO_STYLE_SPECS.popular_lifestyle;
  return callClaude(`Generate a Gemini Imagen image prompt for a photo-realistic social media image.

PHOTO STYLE: ${spec.description}
VISUAL GUIDANCE: ${spec.guidance}
COLOR TREATMENT: ${spec.colorTreatment}
LIGHTING: ${spec.lighting}

POST HOOK: "${post.hook}"
INDUSTRY: ${brand.industry}
BRAND VOICE: ${brand.voice}
TARGET AUDIENCE: ${brand.audience}
BRAND COLORS (subtle accents only): ${brand.colors}

RULES:
- Match the photo style exactly as described
- Photorealistic, high quality, professional photography look
- Composition leaves space for text overlay if needed
- Subject must authentically match the target audience demographic
- Avoid generic stock-photo clichés (no fake handshakes, no suits laughing at salad)
- Candid, authentic energy

Output ONLY the image prompt. No preamble. Maximum 120 words.`);
}

// ─── Infographic ─────────────────────────────────────────────────────────────

const INFOGRAPHIC_STYLE_SPECS: Record<InfographicStyle, { description: string; guidance: string; colorTreatment: string; typography: string }> = {
  isometric_3d: {
    description: '3D isometric illustration with structured perspective',
    guidance: '3D isometric viewpoint (30-degree angle). Layered elevated platforms or stacked elements. Sharp geometric shapes with depth and shadow. Modern color palette with subtle gradients. Each step on its own 3D platform. Connecting lines showing flow.',
    colorTreatment: 'Brand colors as primary, neutral grays for depth',
    typography: 'Modern sans-serif, mid-weight, ALL CAPS for step titles',
  },
  flat_vector: {
    description: 'Clean flat vector illustration with simple shapes and icons',
    guidance: 'Flat vector style (no gradients, no 3D). Simple circular or rounded-rectangle containers. Clean icons inside each shape. Connecting arrows in horizontal or stepped flow. Generous spacing. High contrast for readability.',
    colorTreatment: 'Brand colors with clear differentiation between steps',
    typography: 'Sans-serif, bold for step titles, regular for descriptions',
  },
  doodle_sketched: {
    description: 'Hand-drawn doodle/sketched style with playful lines',
    guidance: 'Hand-drawn aesthetic, slightly imperfect lines. Casual sketched arrows, thought bubbles, hand-drawn icons. Pencil or marker texture. Playful organic flow. White or soft cream background. Warm approachable energy.',
    colorTreatment: 'Soft brand colors, mostly black-line illustrations with color accents',
    typography: 'Hand-lettered feel for headers OR clean sans-serif as contrast',
  },
  watercolor: {
    description: 'Hand-painted watercolor style with soft gradients',
    guidance: 'Watercolor texture and soft gradient washes. Organic flowing shapes (not geometric). Soft color blooms between elements. Hand-painted feel for icons. White space with watercolor splashes as accents. Calm premium artistic energy.',
    colorTreatment: 'Soft brand colors with watercolor texture, muted and gentle',
    typography: 'Elegant serif or hand-lettered headers, clean sans-serif body',
  },
  neon_cyberpunk: {
    description: 'Neon glow cyberpunk style with futuristic elements',
    guidance: 'Dark navy or black background. Bright neon colors (cyan, magenta, electric blue). Glowing edges and light bloom on shapes and text. Tech-style icons (circuit lines, brain, satellite). Code or binary as subtle background texture. Sharp geometric shapes with glow halos.',
    colorTreatment: 'Dark base + neon accents. Brand colors only if they fit neon palette.',
    typography: 'Modern futuristic sans-serif with glow effects, possibly monospace',
  },
  minimalist: {
    description: 'Clean minimalist style with extensive negative space',
    guidance: 'Significant negative space (60-70% white/empty). Single horizontal or vertical line connecting numbered points. Tiny simple line icons (not filled, not colored). Numbered steps in plain typography. One accent color maximum used sparingly. Refined premium magazine-editorial feel.',
    colorTreatment: 'Black/white/neutral with ONE brand accent used minimally',
    typography: 'Clean modern sans-serif, light weight body, medium headers',
  },
};

async function buildInfographicPrompt(post: PostContext, brand: BrandContext, style: InfographicStyle): Promise<string> {
  const spec = INFOGRAPHIC_STYLE_SPECS[style] ?? INFOGRAPHIC_STYLE_SPECS.flat_vector;
  return callClaude(`Generate a Gemini Imagen image prompt for an infographic social media post.

DESIGN STYLE: ${spec.description}
VISUAL GUIDANCE: ${spec.guidance}
COLOR TREATMENT: ${spec.colorTreatment}
TYPOGRAPHY: ${spec.typography}

POST CONTENT: "${post.caption}"
INDUSTRY: ${brand.industry}
BRAND COLORS: ${brand.colors}
BRAND NAME: ${brand.businessName}
PLATFORM: ${post.platform}

RULES:
- Match the design style exactly
- Include 3-5 specific data points or steps extracted from the post content
- ALL TEXT must be legible and accurately spelled — specify every word exactly
- Title prominent at top, supporting info below
- Specify EXACT TEXT for every label, step, and title
- Visual hierarchy: title > steps > details
- Be exhaustively specific about colors, icons, layout, and every text element

Output ONLY the image prompt. No preamble.`);
}

// ─── Text Graphic ────────────────────────────────────────────────────────────

async function buildTextGraphicPrompt(post: PostContext, brand: BrandContext): Promise<string> {
  return callClaude(`Generate a Gemini Imagen image prompt for a branded text graphic (quote card, tip card, or hook card).

TEXT TO DISPLAY: "${post.hook}"
SECONDARY TEXT: "${post.subtext ?? ''}"
BRAND COLORS: ${brand.colors}
INDUSTRY: ${brand.industry}
PLATFORM: ${post.platform}

RULES:
- Bold high-contrast typography as focal point
- Brand-colored background (gradient or solid)
- Subtle texture, geometric shapes, or pattern
- ALL TEXT must be perfectly legible — specify exact words, size, weight, color
- Square format
- Specify the EXACT TEXT word-for-word in the prompt

Output ONLY the image prompt. No preamble. Maximum 100 words.`);
}

// ─── Illustration ────────────────────────────────────────────────────────────

async function buildIllustrationPrompt(post: PostContext, brand: BrandContext): Promise<string> {
  return callClaude(`Generate a Gemini Imagen image prompt for a branded illustration.

POST CONCEPT: "${post.hook}"
INDUSTRY: ${brand.industry}
BRAND COLORS: ${brand.colors}
ILLUSTRATION STYLE: modern flat with subtle gradients

RULES:
- Clean illustration, NOT photorealistic
- Strong visual metaphor for the post concept
- Brand colors as primary palette
- Modern, professional, on-brand
- Avoid generic clip-art look
- Clear focal point
- No text in image

Output ONLY the image prompt. No preamble. Maximum 80 words.`);
}

// ─── Product Mockup ──────────────────────────────────────────────────────────

async function buildProductMockupPrompt(post: PostContext, brand: BrandContext): Promise<string> {
  return callClaude(`Generate a Gemini Imagen image prompt for a product/service mockup.

BUSINESS: ${brand.businessName}
PRODUCT/SERVICE: ${brand.product ?? brand.description}
POST CONTEXT: "${post.caption}"
INDUSTRY: ${brand.industry}
BRAND COLORS: ${brand.colors}

RULES:
- Realistic mockup showing product or service outcome in use
- Professional commercial photography or 3D render style
- Clean background making product the hero
- Soft professional lighting
- For app/digital: show on appropriate device
- For service: show the outcome or result

Output ONLY the image prompt. No preamble. Maximum 100 words.`);
}

// ─── Mixed Text Visual ───────────────────────────────────────────────────────

async function buildMixedTextVisualPrompt(post: PostContext, brand: BrandContext): Promise<string> {
  return callClaude(`Generate a Gemini Imagen image prompt combining a photo/illustration background with text overlay.

HEADLINE TEXT: "${post.hook}"
BRAND COLORS: ${brand.colors}
INDUSTRY: ${brand.industry}
PLATFORM: ${post.platform}

RULES:
- Photo or illustration background with composition leaving space for text
- Bold text overlay with strong contrast against background
- Background slightly desaturated or color-overlaid for text readability
- Text in rule-of-thirds zone
- Specify EXACT text content word-for-word
- Specify text size, weight, color, and exact placement
- Brand-consistent color treatment

Output ONLY the image prompt. No preamble. Maximum 100 words.`);
}
