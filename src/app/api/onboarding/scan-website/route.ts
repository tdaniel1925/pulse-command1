import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function resolveUrl(src: string, base: string): string {
  try {
    return new URL(src, base).href
  } catch {
    return src
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`
    const origin = new URL(cleanUrl).origin

    // Fetch page text via Jina and screenshot in parallel
    const [jinaRes, screenshotRes] = await Promise.all([
      fetch(`https://r.jina.ai/${cleanUrl}`, {
        headers: { 'Accept': 'text/plain', 'X-Return-Format': 'markdown' },
      }),
      fetch(`https://r.jina.ai/${cleanUrl}`, {
        headers: { 'Accept': 'image/png', 'X-Return-Format': 'screenshot' },
      }).catch(() => null),
    ])

    if (!jinaRes.ok) {
      console.error('Jina fetch failed:', jinaRes.status, jinaRes.statusText)
      return NextResponse.json({ error: `Could not scan website (Jina ${jinaRes.status})` }, { status: 400 })
    }

    const pageContent = await jinaRes.text()

    // Get screenshot as base64 if available
    let screenshotBase64: string | null = null
    if (screenshotRes?.ok) {
      const buf = await screenshotRes.arrayBuffer()
      screenshotBase64 = Buffer.from(buf).toString('base64')
    }

    // Extract logo URL from HTML with fallbacks
    let logoUrl = ''
    let primaryColor = ''

    try {
      const htmlRes = await fetch(cleanUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseCommandBot/1.0)' },
        signal: AbortSignal.timeout(6000),
      })
      const html = await htmlRes.text()

      // 1. og:image
      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
        ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      if (ogImage?.[1]) logoUrl = resolveUrl(ogImage[1], cleanUrl)

      // 2. twitter:image
      if (!logoUrl) {
        const tw = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
          ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)
        if (tw?.[1]) logoUrl = resolveUrl(tw[1], cleanUrl)
      }

      // 3. apple-touch-icon
      if (!logoUrl) {
        const apple = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
        if (apple?.[1]) logoUrl = resolveUrl(apple[1], cleanUrl)
      }

      // 4. favicon tag or default /favicon.ico
      if (!logoUrl) {
        const fav = html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i)
        logoUrl = fav?.[1] ? resolveUrl(fav[1], cleanUrl) : `${origin}/favicon.ico`
      }

      // theme-color
      const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
      if (themeColor?.[1]) primaryColor = themeColor[1]

    } catch {
      logoUrl = `${origin}/favicon.ico`
    }

    // Build Claude message — include screenshot if available for visual brand extraction
    const userContent: Anthropic.MessageParam['content'] = screenshotBase64
      ? [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: screenshotBase64 },
          },
          {
            type: 'text',
            text: `This is a screenshot of the website ${cleanUrl}. Also here is the page text content:\n\n${pageContent.slice(0, 4000)}\n\nExtract brand information. Return ONLY valid JSON:
{
  "businessName": "string",
  "tagline": "string",
  "description": "string (1-2 sentences about what they do)",
  "industry": "string",
  "primaryColor": "string (dominant brand hex color you can see in the screenshot, e.g. #2563eb)",
  "toneOfVoice": "string (professional/casual/bold/warm/friendly/authoritative)"
}`,
          },
        ]
      : [
          {
            type: 'text',
            text: `Extract brand information from this website content. Return ONLY valid JSON:
{
  "businessName": "string",
  "tagline": "string",
  "description": "string (1-2 sentences about what they do)",
  "industry": "string",
  "primaryColor": "string (hex color if you can infer it, else empty string)",
  "toneOfVoice": "string (professional/casual/bold/warm/friendly/authoritative)"
}

Website content:
${pageContent.slice(0, 8000)}`,
          },
        ]

    const message = await getAnthropic().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const extracted = JSON.parse(jsonStr)

    return NextResponse.json({
      success: true,
      data: {
        ...extracted,
        logoUrl,
        primaryColor: primaryColor || extracted.primaryColor || '',
        usedScreenshot: !!screenshotBase64,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('scan-website error:', message)
    return NextResponse.json({ error: `Scan failed: ${message}` }, { status: 500 })
  }
}
