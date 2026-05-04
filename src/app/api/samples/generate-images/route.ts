import { NextRequest, NextResponse } from 'next/server'
import { generateWithGemini } from '@/lib/image-engine/gemini-generator'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const MAX_PER_WEEK = 2

const getAnthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')
  return new Anthropic({ apiKey })
}

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

async function generateContent() {
  const message = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a social media expert for Oakridge Roofing, a family-owned roofing company with 20+ years of experience. Generate fresh, unique social media content. Every time you are called, produce COMPLETELY DIFFERENT content — different angles, hooks, stories, and messaging.

Return ONLY valid JSON with this exact structure:
{
  "posts": {
    "instagram": {
      "content": "engaging Instagram post with emojis and storytelling hook (2-3 sentences)",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5"
    },
    "linkedin": {
      "content": "professional LinkedIn thought leadership post (3-4 sentences)",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4"
    },
    "facebook": {
      "content": "conversational Facebook post with a question to drive engagement (2-3 sentences)",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4"
    }
  },
  "reels": {
    "brand_story": "short punchy caption for brand story reel with emojis and hashtags",
    "process": "short punchy caption for behind-the-scenes process reel with emojis and hashtags",
    "tips": "short punchy caption for educational tips reel with emojis and hashtags",
    "testimonial": "short punchy caption for customer testimonial reel with emojis and hashtags"
  }
}`
    }],
  })
  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(jsonStr)
  } catch {
    console.error('Content generation JSON parse failed:', raw.slice(0, 300))
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP: max 2 per week
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    const admin = createAdminClient()

    // Check rate limit (graceful if table doesn't exist)
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count, error: rlErr } = await admin
        .from('sample_generations')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', oneWeekAgo)

      if (!rlErr && (count ?? 0) >= MAX_PER_WEEK) {
        return NextResponse.json(
          { error: "You've reached the limit of 2 generations per week. Please try again later." },
          { status: 429 }
        )
      }
    } catch {
      // Table may not exist yet — skip rate limiting
    }

    // Generate text content with Claude and images with Gemini in parallel
    const [content, ...imageResults] = await Promise.all([
      generateContent(),
      ...IMAGE_PROMPTS.map(async (img) => {
        try {
          const { imageBuffer, mimeType } = await generateWithGemini(img.prompt, {
            model: 'nano_banana_2',
            aspectRatio: img.aspectRatio,
          })
          const ext = mimeType.includes('png') ? 'png' : 'jpg'
          const path = `samples/${img.key}_${Date.now()}.${ext}`
          const { error } = await admin.storage
            .from('content')
            .upload(path, imageBuffer, { contentType: mimeType, upsert: true })
          if (error) {
            console.error(`Upload failed for ${img.key}:`, error)
            return { key: img.key, url: null }
          }
          const { data: { publicUrl } } = admin.storage.from('content').getPublicUrl(path)
          return { key: img.key, url: publicUrl }
        } catch (err) {
          console.error(`Generation failed for ${img.key}:`, err)
          return { key: img.key, url: null }
        }
      }),
    ])

    const images: Record<string, string> = {}
    for (const r of imageResults) {
      if (r.url) images[r.key] = r.url
    }

    // Log generation for rate limiting
    await admin.from('sample_generations').insert({
      ip_address: ip,
      content_generated: !!content,
      images_generated: Object.keys(images).length,
    }).catch(() => {}) // Don't fail if table doesn't exist yet

    return NextResponse.json({ success: true, images, content })
  } catch (err) {
    console.error('generate-images error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
