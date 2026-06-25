/**
 * Studio Design Bible — the token engine that makes "bad design impossible".
 *
 * Given a small set of high-level design choices (a "Look", the brand accent,
 * fonts, button/image style), it derives a full set of CSS custom properties.
 * Sections only ever read these tokens, so every page is internally consistent
 * and on-brand by construction — the user never picks a raw color/size.
 *
 * Premium upgrade: the brand accent is fed through HSL math to tint surfaces,
 * borders, and gradients — so the brand color colors the WHOLE page, not just
 * the buttons. Plus gradient + elevation + motion tokens for a Framer-grade feel.
 */

export type ThemeName = 'Sunset' | 'Bold' | 'Midnight' | 'Editorial' | 'Mono' | 'Luxe'
export type FontPair = 'Geometric' | 'Grotesque' | 'Rounded' | 'Serif' | 'Slab'
export type Density = 'Compact' | 'Cozy' | 'Spacious'
export type ButtonStyle = 'Solid' | 'Outline' | 'Pill' | 'Hard' | 'Gradient'
export type ImageTreatment = 'Soft' | 'Clean' | 'Frame' | 'Duotone' | 'Outline'

export interface ThemeProps {
  theme?: ThemeName
  accent?: string
  radius?: number
  density?: Density
  fontPair?: FontPair
  buttonStyle?: ButtonStyle
  imageTreatment?: ImageTreatment
}

// ── HSL colour helpers (so the accent can tint the whole palette) ─────────────

function hexToRgb(hex: string): [number, number, number] {
  let h = String(hex).replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}
function accentHsl(accent: string): [number, number, number] {
  try { return rgbToHsl(...hexToRgb(accent)) } catch { return [18, 73, 55] }
}

/** Pick a readable foreground (#dark or #light) for a given background hex. */
export function readable(hex: string): string {
  try {
    const [r, g, b] = hexToRgb(hex)
    const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return L > 0.62 ? '#17120D' : '#FFFFFF'
  } catch {
    return '#FFFFFF'
  }
}

// ── Looks: each is a mood recipe. Surfaces/borders are derived from the brand
//    accent's HUE so the whole page feels custom, while lightness/saturation
//    targets keep the mood consistent regardless of which accent comes in. ─────

interface LookRecipe {
  dark: boolean
  // Lightness/saturation targets for derived neutrals (hue borrowed from accent).
  bgL: number; bgS: number
  surfaceL: number
  surface2L: number; surface2S: number
  fgL: number
  mutedL: number; mutedS: number
  borderL: number; borderS: number
  // accent2 derivation (hue shift from accent)
  accent2Hue: number; accent2S: number; accent2L: number
  shadow: string
  defaultRadius: number
  borderW: string
  defaultFont: FontPair
  defaultButton: ButtonStyle
}

export const LOOKS: Record<ThemeName, LookRecipe> = {
  // Warm, editorial-soft (the original Atlas mood) — accent clearly tints surfaces
  Sunset: { dark: false, bgL: 96, bgS: 42, surfaceL: 100, surface2L: 93, surface2S: 38, fgL: 14, mutedL: 46, mutedS: 18, borderL: 87, borderS: 32, accent2Hue: 28, accent2S: 62, accent2L: 55, shadow: '0 14px 38px rgba(40,30,20,.10)', defaultRadius: 16, borderW: '1px', defaultFont: 'Geometric', defaultButton: 'Solid' },
  // High-contrast, punchy, hard shadows — tinted surfaces, ink border
  Bold: { dark: false, bgL: 99, bgS: 30, surfaceL: 100, surface2L: 94, surface2S: 48, fgL: 8, mutedL: 38, mutedS: 12, borderL: 8, borderS: 0, accent2Hue: 38, accent2S: 95, accent2L: 58, shadow: '6px 6px 0 var(--fg)', defaultRadius: 8, borderW: '2px', defaultFont: 'Grotesque', defaultButton: 'Hard' },
  // Deep dark, glowy — accent-tinted dark surfaces
  Midnight: { dark: true, bgL: 9, bgS: 34, surfaceL: 13, surface2L: 18, surface2S: 30, fgL: 95, mutedL: 64, mutedS: 16, borderL: 24, borderS: 26, accent2Hue: 32, accent2S: 90, accent2L: 60, shadow: '0 24px 60px rgba(0,0,0,.55)', defaultRadius: 16, borderW: '1px', defaultFont: 'Geometric', defaultButton: 'Gradient' },
  // Refined, type-led, crisp light
  Editorial: { dark: false, bgL: 98, bgS: 6, surfaceL: 100, surface2L: 95, surface2S: 8, fgL: 11, mutedL: 44, mutedS: 6, borderL: 90, borderS: 8, accent2Hue: -18, accent2S: 55, accent2L: 50, shadow: '0 18px 50px rgba(20,20,30,.08)', defaultRadius: 6, borderW: '1px', defaultFont: 'Serif', defaultButton: 'Outline' },
  // Monochrome, near-neutral, very minimal
  Mono: { dark: false, bgL: 99, bgS: 3, surfaceL: 100, surface2L: 96, surface2S: 3, fgL: 12, mutedL: 46, mutedS: 3, borderL: 91, borderS: 3, accent2Hue: 0, accent2S: 10, accent2L: 40, shadow: '0 10px 30px rgba(0,0,0,.06)', defaultRadius: 10, borderW: '1px', defaultFont: 'Grotesque', defaultButton: 'Solid' },
  // Dark luxe, gold-ish accent2, generous
  Luxe: { dark: true, bgL: 11, bgS: 14, surfaceL: 15, surface2L: 19, surface2S: 14, fgL: 94, mutedL: 62, mutedS: 8, borderL: 24, borderS: 12, accent2Hue: 45, accent2S: 60, accent2L: 62, shadow: '0 30px 70px rgba(0,0,0,.5)', defaultRadius: 14, borderW: '1px', defaultFont: 'Serif', defaultButton: 'Gradient' },
}

const FONT_PAIRS: Record<FontPair, [string, string]> = {
  Geometric: ['Sora', 'Manrope'],
  Grotesque: ['Space Grotesk', 'Manrope'],
  Rounded: ['Outfit', 'Manrope'],
  Serif: ['Fraunces', 'Manrope'],
  Slab: ['Space Grotesk', 'Manrope'],
}

const DENSITY_SCALE: Record<Density, number> = { Compact: 0.82, Cozy: 1, Spacious: 1.32 }

const DEFAULT_ACCENT = '#E0603A'

/** Derive the full CSS-variable token map from high-level design props. */
export function tokens(p: ThemeProps = {}): Record<string, string> {
  const look = LOOKS[p.theme ?? 'Sunset'] ?? LOOKS.Sunset
  const accent = (p.accent && /^#?[0-9a-fA-F]{3,6}$/.test(p.accent.replace('#', ''))) ? p.accent : DEFAULT_ACCENT
  const accentFg = readable(accent)
  const [ah, as] = accentHsl(accent)

  // Neutrals borrow the accent HUE at low saturation → the brand colour subtly
  // tints the entire surface palette (this is what makes it feel custom).
  const bg = hslToHex(ah, look.bgS, look.bgL)
  const surface = hslToHex(ah, Math.min(look.bgS, 14), look.surfaceL)
  const surface2 = hslToHex(ah, look.surface2S, look.surface2L)
  const fg = hslToHex(ah, look.dark ? 18 : 24, look.fgL)
  const muted = hslToHex(ah, look.mutedS, look.mutedL)
  const border = hslToHex(ah, look.borderS, look.borderL)
  const accent2 = hslToHex(ah + look.accent2Hue, Math.max(as * 0.9, look.accent2S * 0.7), look.accent2L)

  const r = Number(p.radius != null ? p.radius : look.defaultRadius)
  const padScale = (p.density && DENSITY_SCALE[p.density]) || 1
  const fonts = (p.fontPair && FONT_PAIRS[p.fontPair]) || FONT_PAIRS[look.defaultFont]
  const borderW = look.borderW

  // Accent tints for soft backgrounds / glows.
  const accentSoft = hslToHex(ah, Math.min(as, 60), look.dark ? 22 : 94)
  const accentDeep = hslToHex(ah, Math.min(as + 6, 92), Math.max(28, look.dark ? 48 : 44))
  const gradAccent = `linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)`
  const gradSubtle = look.dark
    ? `linear-gradient(180deg, ${surface} 0%, ${bg} 100%)`
    : `linear-gradient(180deg, ${surface} 0%, ${accentSoft} 140%)`

  const btnStyle = p.buttonStyle ?? look.defaultButton
  let btn = { bg: accent, fg: accentFg, border: 'transparent', shadow: 'none', radius: `${Math.max(2, r - 4)}px` }
  if (btnStyle === 'Outline') btn = { bg: 'transparent', fg: accent, border: accent, shadow: 'none', radius: `${Math.max(2, r - 4)}px` }
  if (btnStyle === 'Pill') btn = { bg: accent, fg: accentFg, border: 'transparent', shadow: 'none', radius: '999px' }
  if (btnStyle === 'Hard') btn = { bg: accent, fg: accentFg, border: fg, shadow: `5px 5px 0 ${fg}`, radius: '6px' }
  if (btnStyle === 'Gradient') btn = { bg: gradAccent, fg: accentFg, border: 'transparent', shadow: `0 10px 30px ${accent}44`, radius: '999px' }

  let img = { radius: `${r}px`, shadow: look.shadow, border: 'none', filter: 'none' }
  if (p.imageTreatment === 'Clean') img = { radius: '2px', shadow: 'none', border: 'none', filter: 'none' }
  if (p.imageTreatment === 'Frame') img = { radius: `${r}px`, shadow: '0 6px 18px rgba(0,0,0,.10)', border: `${borderW} solid ${border}`, filter: 'none' }
  if (p.imageTreatment === 'Duotone') img = { radius: `${r}px`, shadow: look.shadow, border: 'none', filter: 'saturate(1.15) contrast(1.03)' }
  if (p.imageTreatment === 'Outline') img = { radius: `${Math.max(2, r - 6)}px`, shadow: 'none', border: `2px solid ${fg}`, filter: 'none' }

  // Elevation + hover tokens for premium depth/motion (used by polish CSS).
  const elevate = look.dark ? '0 12px 40px rgba(0,0,0,.45)' : '0 12px 40px rgba(20,20,30,.10)'
  const hover = look.dark ? '0 20px 60px rgba(0,0,0,.55)' : `0 22px 60px ${accent}26`

  return {
    '--bg': bg, '--surface': surface, '--surface-2': surface2,
    '--fg': fg, '--muted': muted,
    '--accent': accent, '--accent-fg': accentFg, '--accent-2': accent2,
    '--accent-soft': accentSoft, '--accent-deep': accentDeep,
    '--border': border, '--border-w': borderW, '--shadow': look.shadow,
    '--grad-accent': gradAccent, '--grad-subtle': gradSubtle,
    '--elevate': elevate, '--hover-shadow': hover,
    '--radius': `${r}px`, '--radius-sm': `${Math.max(0, r - 6)}px`, '--pad-scale': String(padScale),
    '--font-display': `'${fonts[0]}'`, '--font-body': `'${fonts[1]}'`,
    '--btn-bg': btn.bg, '--btn-fg': btn.fg, '--btn-border': btn.border, '--btn-shadow': btn.shadow, '--btn-radius': btn.radius,
    '--img-radius': img.radius, '--img-shadow': img.shadow, '--img-border': img.border, '--img-filter': img.filter,
  }
}

/** tokens() as a React style object (CSS custom props are valid inline styles). */
export function tokenStyle(p: ThemeProps = {}): React.CSSProperties {
  return tokens(p) as React.CSSProperties
}

// ── Curated "Looks" for the editor picker (premium, named, with previews) ─────
export interface LookPreset {
  id: ThemeName
  name: string
  blurb: string
  fontPair: FontPair
  buttonStyle: ButtonStyle
  density: Density
  radius: number
  imageTreatment: ImageTreatment
}

export const LOOK_PRESETS: LookPreset[] = [
  { id: 'Editorial', name: 'Editorial', blurb: 'Refined, type-led, elegant', fontPair: 'Serif', buttonStyle: 'Outline', density: 'Spacious', radius: 6, imageTreatment: 'Clean' },
  { id: 'Sunset', name: 'Warm Minimal', blurb: 'Soft, friendly, approachable', fontPair: 'Geometric', buttonStyle: 'Solid', density: 'Cozy', radius: 16, imageTreatment: 'Soft' },
  { id: 'Bold', name: 'Bold Tech', blurb: 'High-contrast, punchy, confident', fontPair: 'Grotesque', buttonStyle: 'Hard', density: 'Cozy', radius: 8, imageTreatment: 'Outline' },
  { id: 'Mono', name: 'Monochrome', blurb: 'Clean, neutral, ultra-minimal', fontPair: 'Grotesque', buttonStyle: 'Solid', density: 'Spacious', radius: 10, imageTreatment: 'Clean' },
  { id: 'Midnight', name: 'Midnight', blurb: 'Deep dark with a glow', fontPair: 'Geometric', buttonStyle: 'Gradient', density: 'Cozy', radius: 16, imageTreatment: 'Soft' },
  { id: 'Luxe', name: 'Dark Luxe', blurb: 'Premium, gold-touched, generous', fontPair: 'Serif', buttonStyle: 'Gradient', density: 'Spacious', radius: 14, imageTreatment: 'Soft' },
]

/** Map a LookPreset to a full ThemeProps (preserving the page's accent). */
export function applyLook(preset: LookPreset, accent?: string): ThemeProps {
  return {
    theme: preset.id,
    accent,
    fontPair: preset.fontPair,
    buttonStyle: preset.buttonStyle,
    density: preset.density,
    radius: preset.radius,
    imageTreatment: preset.imageTreatment,
  }
}

/**
 * The Design Bible move: turn a brand into a constrained, guaranteed-good Look.
 * Picks a fitting preset from the brand accent (dark/saturation cues) and feeds
 * the real accent through. Output is always valid — the brand colour can only
 * ever land inside the token system, never break it.
 */
export function deriveThemeFromBrand(input: {
  accent?: string | null
  prefersDark?: boolean
  fontPair?: FontPair
}): ThemeProps {
  const accent = (input.accent && /^#?[0-9a-fA-F]{3,6}$/.test(input.accent.replace('#', '')))
    ? (input.accent.startsWith('#') ? input.accent : `#${input.accent}`)
    : undefined

  // Choose a Look by intent from the accent's saturation/lightness.
  const [, sat, light] = accent ? accentHsl(accent) : [0, 60, 55]
  let presetId: ThemeName = 'Sunset' // warm minimal default
  if (input.prefersDark) presetId = 'Midnight'
  else if (sat > 78 && light < 60) presetId = 'Bold' // punchy, saturated → bold tech
  else if (sat < 16) presetId = 'Mono' // desaturated brand → monochrome

  const preset = LOOK_PRESETS.find((p) => p.id === presetId) ?? LOOK_PRESETS[1]
  return { ...applyLook(preset, accent), ...(input.fontPair ? { fontPair: input.fontPair } : {}) }
}
