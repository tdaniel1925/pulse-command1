import { NextResponse } from 'next/server'
import { generateWithGemini } from '@/lib/image-engine/gemini-generator'
import { createAdminClient } from '@/lib/supabase/admin'

const IMAGE_PROMPTS = [
  {
    key: 'instagram_roofing',
    prompt: `Professional photograph of a residential home with a beautiful new asphalt shingle roof, shot during golden hour with warm sunlight. The home is a two-story craftsman style with clean gutters and pristine roofing. Lush green lawn in the foreground. No text overlay. Photorealistic, high quality, editorial style photography.`,
    aspectRatio: '1:1' as const,
  },
  {
    key: 'linkedin_commercial',
    prompt: `Aerial photograph of a large commercial building rooftop being worked on by a professional roofing crew wearing safety gear and hard hats. Modern industrial setting, clear blue sky. The crew is actively installing roofing membrane. Professional, corporate feel. No text overlay. Photorealistic, high quality, editorial style photography.`,
    aspectRatio: '16:9' as const,
  },
  {
    key: 'facebook_inspection',
    prompt: `Beautiful suburban home exterior from curb view, well-maintained landscaping, the focus is on the clean roof with visible quality shingles. Sunny day with a few clouds. The home looks inviting and well-cared-for. Warm, friendly neighborhood feel. No text overlay. Photorealistic, high quality, editorial style photography.`,
    aspectRatio: '16:9' as const,
  },
  // UGC-style vertical video thumbnails (9:16)
  {
    key: 'reel_brand_story',
    prompt: `UGC style selfie video thumbnail of a confident middle-aged man in a branded polo shirt standing in front of a beautiful home with a new roof. He's speaking directly to camera with a warm smile, holding his phone. Natural lighting, slightly grainy authentic feel like a real TikTok or Instagram Reel. Vertical 9:16 format. No text overlay. Photorealistic.`,
    aspectRatio: '9:16' as const,
  },
  {
    key: 'reel_process',
    prompt: `UGC style action shot thumbnail of a roofing crew working on a large commercial roof, shot from a worker's perspective looking across the rooftop. Hard hats, tool belts, partially completed roof visible. Dynamic angle, golden hour lighting, authentic behind-the-scenes feel like a real construction TikTok. Vertical 9:16 format. No text overlay. Photorealistic.`,
    aspectRatio: '9:16' as const,
  },
  {
    key: 'reel_tips',
    prompt: `UGC style close-up thumbnail of a roofing expert pointing up at damaged shingles on a residential roof, shot from below looking up. The person is wearing work gloves and a cap. Educational feel, like they're about to explain something important. Natural daylight, authentic smartphone camera quality. Vertical 9:16 format. No text overlay. Photorealistic.`,
    aspectRatio: '9:16' as const,
  },
  {
    key: 'reel_testimonial',
    prompt: `UGC style thumbnail of a happy homeowner couple standing in their driveway, smiling at camera with their beautifully roofed home behind them. They look genuinely grateful and excited. Warm afternoon light, casual clothing, authentic selfie-style framing like a real customer testimonial video. Vertical 9:16 format. No text overlay. Photorealistic.`,
    aspectRatio: '9:16' as const,
  },
]

export async function POST() {
  try {
    const admin = createAdminClient()
    const results: Record<string, string> = {}

    for (const img of IMAGE_PROMPTS) {
      try {
        const { imageBuffer, mimeType } = await generateWithGemini(img.prompt, {
          model: 'nano_banana_2',
          aspectRatio: img.aspectRatio,
        })

        const ext = mimeType.includes('png') ? 'png' : 'jpg'
        const path = `samples/${img.key}.${ext}`

        const { error } = await admin.storage
          .from('content')
          .upload(path, imageBuffer, {
            contentType: mimeType,
            upsert: true,
          })

        if (error) {
          console.error(`Upload failed for ${img.key}:`, error)
          continue
        }

        const { data: { publicUrl } } = admin.storage.from('content').getPublicUrl(path)
        results[img.key] = publicUrl
      } catch (err) {
        console.error(`Generation failed for ${img.key}:`, err)
      }
    }

    return NextResponse.json({ success: true, images: results })
  } catch (err) {
    console.error('generate-images error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
