import { generateWithGemini } from '@/lib/image-engine/gemini-generator'
import { IMAGE_ENGINE_CONFIG } from '@/lib/image-engine/config'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SlotShape } from '@/components/studio/Slot'

/**
 * Studio image generation — fills landing-page image slots with on-brand Gemini
 * images. Simpler than the social-post engine: no classifier/layout logic, just
 * "given a scene + brand, make an image that fits this slot's shape."
 *
 * Every call is best-effort: on any failure it returns null so the slot falls
 * back to a themed placeholder and the page still renders/publishes.
 */

// Map a kit slot shape to the nearest Gemini-supported aspect ratio.
const SHAPE_TO_ASPECT: Record<SlotShape, '1:1' | '4:5' | '9:16' | '16:9' | '3:4'> = {
  '1/1': '1:1',
  '4/5': '4:5',
  '3/4': '3:4',
  '16/9': '16:9',
  '21/9': '16:9', // closest supported
  '4/3': '16:9', // closest landscape
  '3/2': '16:9',
}

export interface StudioBrand {
  businessName: string
  description?: string
  primaryColor?: string | null
  vibe?: string
}

/**
 * Generate one image for a slot and return its public URL (or null on failure).
 * `scene` is a short description of what the image should depict (from the AI's
 * slot `alt` text); `brand` steers style/palette so it matches the page.
 */
export async function generateSlotImage(params: {
  clientId: string
  pageKey: string // stable key for storage path (e.g. "hero", "showcase")
  scene: string
  shape: SlotShape
  brand: StudioBrand
}): Promise<string | null> {
  const { clientId, pageKey, scene, shape, brand } = params

  const prompt = buildPrompt(scene, brand)
  try {
    const { imageBuffer, mimeType } = await generateWithGemini(prompt, {
      model: 'nano_banana_2',
      aspectRatio: SHAPE_TO_ASPECT[shape],
    })
    return await upload(clientId, pageKey, imageBuffer, mimeType)
  } catch (err) {
    console.error(`[studio/images] generation failed for ${pageKey}:`, err)
    return null
  }
}

// A fixed set of cohesive photographic styles. Every image on a page uses the
// SAME style (chosen deterministically from the brand) so they look like one
// shoot, not random stock — the biggest cross-image cohesion win.
const PHOTO_STYLES = [
  'soft natural daylight, shallow depth of field, warm tones, editorial photography, 35mm',
  'bright clean studio lighting, crisp focus, minimal background, premium product photography',
  'moody cinematic lighting, rich contrast, atmospheric, shot on film, muted palette',
  'airy and minimal, lots of negative space, pastel light, modern lifestyle photography',
  'bold high-contrast lighting, vibrant saturated color, dynamic angle, contemporary editorial',
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** Deterministic per-brand photographic style so all images on a page cohere. */
export function pageStyleToken(brand: StudioBrand): string {
  return PHOTO_STYLES[hashStr(brand.businessName || 'brand') % PHOTO_STYLES.length]
}

function buildPrompt(scene: string, brand: StudioBrand): string {
  const style = pageStyleToken(brand)
  const palette = brand.primaryColor ? ` Color grade to harmonize with the brand accent ${brand.primaryColor} (subtle, not oversaturated).` : ''
  const ctx = brand.description ? ` Business context: ${brand.description}.` : ''
  const tone = brand.vibe ? ` Brand tone: ${brand.vibe}.` : ''
  return (
    `Photorealistic marketing photograph for "${brand.businessName}". ` +
    `Subject: ${scene}.${ctx}${tone} ` +
    `Photographic style (keep consistent across all images for this brand): ${style}.${palette} ` +
    `Real-world scene, natural and authentic — not generic stock, no people staring at camera unless natural. ` +
    `No text, no logos, no watermarks, no UI. Composed as a premium website hero/feature image.`
  )
}

const UPLOAD_RETRIES = 3

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function upload(
  clientId: string,
  pageKey: string,
  imageBuffer: Buffer,
  mimeType: string,
): Promise<string> {
  const admin = createAdminClient()
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const path = `studio/${clientId}/${pageKey}_${Date.now()}.${ext}`
  const bucket = IMAGE_ENGINE_CONFIG.storage.bucket

  // Storage uploads of large (~1-2MB) images occasionally hit transient network
  // failures ("fetch failed"); retry a few times with backoff before giving up.
  let lastErr = ''
  for (let attempt = 1; attempt <= UPLOAD_RETRIES; attempt++) {
    try {
      const { error } = await admin.storage.from(bucket).upload(path, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      })
      if (!error) {
        const { data } = admin.storage.from(bucket).getPublicUrl(path)
        return data.publicUrl
      }
      lastErr = error.message
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err)
    }
    if (attempt < UPLOAD_RETRIES) {
      console.warn(`[studio/images] upload attempt ${attempt} failed (${lastErr}); retrying...`)
      await sleep(attempt * 700)
    }
  }
  throw new Error(`Storage upload failed after ${UPLOAD_RETRIES} attempts: ${lastErr}`)
}
