export type DeckMode = 'standard' | 'nano' | 'infographic' | 'document' | 'story'
export type TemplateId = 'boardroom' | 'pitch' | 'editorial' | 'obsidian' | 'grove' | 'atlas'
export type NarrativeFramework = 'scr' | 'pas' | 'vpc' | 'free'
// scr = Situation-Complication-Resolution (McKinsey)
// pas = Problem-Agitate-Solve (sales)
// vpc = Vision-Proof-CTA (investor)
// free = no framework

export interface DesignTokens {
  // Colors
  background: string
  backgroundAlt: string
  textPrimary: string
  textSecondary: string
  accent: string
  accentLight: string
  border: string
  // Typography
  fontTitle: string
  fontBody: string
  titleWeight: string
  titleAlign: 'left' | 'center'
  // Layout
  slidePadding: string
  textDensity: 'low' | 'medium' | 'high'
  // Slide master
  showLogo: boolean
  showPageNumber: boolean
  showFooterRule: boolean
  footerText: string
  // Image style description for prompts
  imageStyle: string
  // Photography style injected into image prompts
  photographyPromptStyle: string
}

export interface PresentationTemplate {
  id: TemplateId
  name: string
  description: string
  vibe: string
  bestFor: string[]
  tokens: DesignTokens
  previewGradient: string
}

export interface DeckModeConfig {
  id: DeckMode
  name: string
  description: string
  icon: string
  maxWordsPerSlide: number
  maxBulletsPerSlide: number
  imageFrequency: 'none' | 'low' | 'medium' | 'high'
  allowedLayouts: string[]
  claudeInstruction: string
}

const ALL_LAYOUTS = [
  'title', 'bullets', 'image_left', 'image_right', 'quote',
  'stats', 'two_col', 'section', 'nano_statement', 'nano_number',
  'nano_question', 'nano_quote',
  'waterfall', 'timeline', 'comparison', 'process', 'big_stat',
]

const TEMPLATES: PresentationTemplate[] = [
  {
    id: 'boardroom',
    name: 'Boardroom',
    description: 'McKinsey/BCG inspired. Authoritative, data-driven, executive-ready.',
    vibe: 'Executive & authoritative',
    bestFor: ['Board presentations', 'Consulting deliverables', 'Strategic reviews', 'Investor updates'],
    tokens: {
      background: '#FFFFFF',
      backgroundAlt: '#F8F8F8',
      textPrimary: '#0A0A0A',
      textSecondary: '#4A4A4A',
      accent: '#E31937',
      accentLight: '#FFF0F2',
      border: '#E31937',
      fontTitle: 'Georgia',
      fontBody: 'Inter',
      titleWeight: '700',
      titleAlign: 'left',
      slidePadding: 'p-14',
      textDensity: 'high',
      showLogo: true,
      showPageNumber: true,
      showFooterRule: true,
      footerText: 'CONFIDENTIAL',
      imageStyle: 'Black and white photography, high contrast, minimal',
      photographyPromptStyle: 'Black and white editorial photography, high contrast lighting, minimal composition, no color',
    },
    previewGradient: 'from-white to-red-50 border-red-200',
  },
  {
    id: 'pitch',
    name: 'Pitch',
    description: 'Y Combinator / Sequoia style. Clean, bold, investor-ready.',
    vibe: 'Bold & startup-forward',
    bestFor: ['Investor pitches', 'Startup decks', 'Product launches', 'Demo days'],
    tokens: {
      background: '#FFFFFF',
      backgroundAlt: '#F5F5FF',
      textPrimary: '#111111',
      textSecondary: '#555555',
      accent: '#6366F1',
      accentLight: '#EEF2FF',
      border: '#E5E7EB',
      fontTitle: 'Inter',
      fontBody: 'Inter',
      titleWeight: '900',
      titleAlign: 'center',
      slidePadding: 'p-12',
      textDensity: 'low',
      showLogo: true,
      showPageNumber: true,
      showFooterRule: false,
      footerText: '',
      imageStyle: 'Product screenshots and clean modern photography',
      photographyPromptStyle: 'Clean editorial photography, bright natural light, modern minimalist spaces, diverse subjects, candid moments',
    },
    previewGradient: 'from-indigo-50 to-purple-50 border-indigo-200',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine / agency style. Warm, expressive, design-forward.',
    vibe: 'Creative & editorial',
    bestFor: ['Agency presentations', 'Brand strategy', 'Creative pitches', 'Marketing decks'],
    tokens: {
      background: '#FAFAF7',
      backgroundAlt: '#F0EDE6',
      textPrimary: '#1C1C1C',
      textSecondary: '#6B6B6B',
      accent: '#C4633A',
      accentLight: '#FDF1EB',
      border: '#E8E0D5',
      fontTitle: 'Playfair Display',
      fontBody: 'Inter',
      titleWeight: '700',
      titleAlign: 'left',
      slidePadding: 'p-12',
      textDensity: 'medium',
      showLogo: true,
      showPageNumber: true,
      showFooterRule: true,
      footerText: '',
      imageStyle: 'Warm editorial photography, film grain, golden hour',
      photographyPromptStyle: 'Warm film photography aesthetic, golden hour lighting, organic textures, editorial composition, slightly desaturated with warm tones',
    },
    previewGradient: 'from-amber-50 to-orange-50 border-amber-200',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Dark, premium, executive. Gold accents on deep black.',
    vibe: 'Dark & premium',
    bestFor: ['Luxury brands', 'Executive summaries', 'Premium product launches', 'High-stakes pitches'],
    tokens: {
      background: '#0F0F0F',
      backgroundAlt: '#1A1A1A',
      textPrimary: '#F5F5F5',
      textSecondary: '#A0A0A0',
      accent: '#D4AF37',
      accentLight: '#2A2410',
      border: '#D4AF37',
      fontTitle: 'Inter',
      fontBody: 'Inter',
      titleWeight: '800',
      titleAlign: 'left',
      slidePadding: 'p-12',
      textDensity: 'low',
      showLogo: true,
      showPageNumber: true,
      showFooterRule: true,
      footerText: '',
      imageStyle: 'Dark moody photography, dramatic shadows, premium feel',
      photographyPromptStyle: 'Dark moody photography, dramatic chiaroscuro lighting, deep shadows, rich blacks, cinematic quality, premium aesthetic',
    },
    previewGradient: 'from-neutral-900 to-neutral-800 border-neutral-700',
  },
  {
    id: 'grove',
    name: 'Grove',
    description: 'Earthy, purposeful, sustainability. Organic greens and natural warmth.',
    vibe: 'Purposeful & sustainable',
    bestFor: ['Impact reports', 'Sustainability decks', 'B-Corp pitches', 'Purpose-driven brands'],
    tokens: {
      background: '#F7F5F0',
      backgroundAlt: '#EDE8DF',
      textPrimary: '#1A2A1A',
      textSecondary: '#4A6741',
      accent: '#2D6A4F',
      accentLight: '#D8F3DC',
      border: '#95D5B2',
      fontTitle: 'Inter',
      fontBody: 'Inter',
      titleWeight: '700',
      titleAlign: 'left',
      slidePadding: 'p-12',
      textDensity: 'medium',
      showLogo: true,
      showPageNumber: true,
      showFooterRule: false,
      footerText: '',
      imageStyle: 'Nature, sustainability, organic textures, earthy tones',
      photographyPromptStyle: 'Natural light photography, organic earthy tones, sustainable environments, lush greenery, genuine human connection, warm and purposeful',
    },
    previewGradient: 'from-green-50 to-emerald-50 border-green-200',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    description: 'Corporate, trustworthy, financial. Navy authority with clean structure.',
    vibe: 'Trustworthy & corporate',
    bestFor: ['Financial presentations', 'Annual reports', 'Compliance decks', 'Enterprise sales'],
    tokens: {
      background: '#FFFFFF',
      backgroundAlt: '#F0F4F8',
      textPrimary: '#0D1B2A',
      textSecondary: '#4A6580',
      accent: '#1B4F8A',
      accentLight: '#E8F0FA',
      border: '#CBD5E1',
      fontTitle: 'Inter',
      fontBody: 'Inter',
      titleWeight: '700',
      titleAlign: 'left',
      slidePadding: 'p-12',
      textDensity: 'high',
      showLogo: true,
      showPageNumber: true,
      showFooterRule: true,
      footerText: 'PRIVATE & CONFIDENTIAL',
      imageStyle: 'Professional business photography, corporate environments',
      photographyPromptStyle: 'Professional corporate photography, clean office environments, confident business people, bright natural light, trustworthy and authoritative',
    },
    previewGradient: 'from-blue-50 to-slate-50 border-blue-200',
  },
]

const DECK_MODES: DeckModeConfig[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced, professional. A mix of text and visual slides.',
    icon: '📊',
    maxWordsPerSlide: 80,
    maxBulletsPerSlide: 5,
    imageFrequency: 'medium',
    allowedLayouts: ALL_LAYOUTS,
    claudeInstruction: 'Create a balanced, professional presentation with a mix of text and visual slides.',
  },
  {
    id: 'nano',
    name: 'Nano',
    description: 'Ultra-minimal. One big idea per slide. Think TED talk cards.',
    icon: '⚡',
    maxWordsPerSlide: 15,
    maxBulletsPerSlide: 3,
    imageFrequency: 'low',
    allowedLayouts: ['title', 'nano_statement', 'nano_number', 'nano_question', 'nano_quote', 'bullets'],
    claudeInstruction: 'NANO MODE: Each slide communicates ONE idea. Titles are complete statements under 10 words. Minimal text. Think TED talk cards. Prefer nano_ layouts.',
  },
  {
    id: 'infographic',
    name: 'Infographic',
    description: 'Data-driven, visual-first. Every slide has a visual anchor.',
    icon: '📈',
    maxWordsPerSlide: 40,
    maxBulletsPerSlide: 6,
    imageFrequency: 'high',
    allowedLayouts: ['title', 'stats', 'bullets', 'image_left', 'image_right', 'section', 'two_col', 'waterfall', 'timeline', 'comparison', 'process', 'big_stat'],
    claudeInstruction: 'INFOGRAPHIC MODE: Data-driven, visual-first. Every slide should have a visual anchor — a stat, chart data, or image. Use stats layout frequently. Numbers should be prominent.',
  },
  {
    id: 'document',
    name: 'Document',
    description: 'Dense, consulting-style deliverable. Every slide earns its place.',
    icon: '📄',
    maxWordsPerSlide: 150,
    maxBulletsPerSlide: 8,
    imageFrequency: 'none',
    allowedLayouts: ['title', 'bullets', 'two_col', 'section', 'quote', 'stats', 'waterfall', 'timeline', 'comparison', 'process'],
    claudeInstruction: 'DOCUMENT MODE: Dense, consulting-style deliverable. More text is acceptable. Structure like a McKinsey report. Every slide earns its place with specific, substantive content.',
  },
  {
    id: 'story',
    name: 'Story',
    description: 'Cinematic, full-bleed visual storytelling. Images are primary.',
    icon: '🎬',
    maxWordsPerSlide: 20,
    maxBulletsPerSlide: 0,
    imageFrequency: 'high',
    allowedLayouts: ['title', 'image_left', 'image_right', 'quote', 'section', 'nano_statement'],
    claudeInstruction: 'STORY MODE: Cinematic, full-bleed visual storytelling. Images are primary. Text is minimal — just enough to anchor the visual. Think brand film, not presentation.',
  },
]

export const narrativeFrameworks: Record<NarrativeFramework, { name: string; description: string; slideFlow: string }> = {
  scr: {
    name: 'Situation → Complication → Resolution',
    description: 'McKinsey framework. Establish context, introduce the problem, present the solution.',
    slideFlow: 'Open with current situation → Reveal the complication or challenge → Present your resolution → Support with evidence → Close with next steps',
  },
  pas: {
    name: 'Problem → Agitate → Solve',
    description: 'Sales framework. Define the pain, make it feel urgent, present your solution.',
    slideFlow: 'Hook with the problem → Agitate: show what happens if unsolved → Present your solution → Prove it works → CTA',
  },
  vpc: {
    name: 'Vision → Proof → CTA',
    description: 'Investor framework. Paint the future, prove you can get there, ask for commitment.',
    slideFlow: 'Open with the vision → Market opportunity → Your unique approach → Traction and proof → Team → The ask/CTA',
  },
  free: {
    name: 'Free Form',
    description: 'No framework. AI structures the content naturally based on the topic.',
    slideFlow: 'Structure the content in the most logical and compelling order for this specific topic and audience.',
  },
}

export function getTemplate(id: TemplateId): PresentationTemplate {
  const template = TEMPLATES.find((t) => t.id === id)
  if (!template) throw new Error(`Unknown template: ${id}`)
  return template
}

export function getDeckMode(id: DeckMode): DeckModeConfig {
  const mode = DECK_MODES.find((m) => m.id === id)
  if (!mode) throw new Error(`Unknown deck mode: ${id}`)
  return mode
}

export function getAllTemplates(): PresentationTemplate[] {
  return TEMPLATES
}

export function getAllDeckModes(): DeckModeConfig[] {
  return DECK_MODES
}
