import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const MAX_PER_WEEK = 2

const getAnthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')
  return new Anthropic({ apiKey })
}

// Pre-generated image sets that cycle — no new image generation needed
const IMAGE_SETS: Record<string, string>[] = [
  {
    instagram_roofing: '/samples/set1-instagram.jpg',
    linkedin_commercial: '/samples/set1-linkedin.jpg',
    facebook_inspection: '/samples/set1-facebook.jpg',
    reel_brand_story: '/samples/set1-reel-brand.jpg',
    reel_process: '/samples/set1-reel-process.jpg',
    reel_tips: '/samples/set1-reel-tips.jpg',
    reel_testimonial: '/samples/set1-reel-testimonial.jpg',
  },
  {
    instagram_roofing: '/samples/set2-instagram.jpg',
    linkedin_commercial: '/samples/set2-linkedin.jpg',
    facebook_inspection: '/samples/set2-facebook.jpg',
    reel_brand_story: '/samples/set2-reel-brand.jpg',
    reel_process: '/samples/set2-reel-process.jpg',
    reel_tips: '/samples/set2-reel-tips.jpg',
    reel_testimonial: '/samples/set2-reel-testimonial.jpg',
  },
  {
    instagram_roofing: '/samples/set3-instagram.jpg',
    linkedin_commercial: '/samples/set3-linkedin.jpg',
    facebook_inspection: '/samples/set3-facebook.jpg',
    reel_brand_story: '/samples/set3-reel-brand.jpg',
    reel_process: '/samples/set3-reel-process.jpg',
    reel_tips: '/samples/set3-reel-tips.jpg',
    reel_testimonial: '/samples/set3-reel-testimonial.jpg',
  },
  {
    instagram_roofing: '/samples/set4-instagram.jpg',
    linkedin_commercial: '/samples/set4-linkedin.jpg',
    facebook_inspection: '/samples/set4-facebook.jpg',
    reel_brand_story: '/samples/set4-reel-brand.jpg',
    reel_process: '/samples/set4-reel-process.jpg',
    reel_tips: '/samples/set4-reel-tips.jpg',
    reel_testimonial: '/samples/set4-reel-testimonial.jpg',
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
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    const admin = createAdminClient()

    // Check rate limit (graceful if table missing)
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

    // Pick a random image set to cycle through
    const setIndex = Math.floor(Math.random() * IMAGE_SETS.length)
    const images = IMAGE_SETS[setIndex]

    // Generate fresh text content with Claude
    const content = await generateContent()

    // Log generation for rate limiting (ignore errors if table missing)
    try {
      await admin.from('sample_generations').insert({
        ip_address: ip,
        content_generated: !!content,
        images_generated: 0,
      })
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({ success: true, images, content, imageSet: setIndex })
  } catch (err) {
    console.error('generate-content error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
