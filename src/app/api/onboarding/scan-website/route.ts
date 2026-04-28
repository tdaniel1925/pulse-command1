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

    // Use Jina AI to scrape
    const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'markdown' },
    })

    if (!jinaRes.ok) {
      console.error('Jina fetch failed:', jinaRes.status, jinaRes.statusText)
      return NextResponse.json({ error: `Could not scan website (Jina ${jinaRes.status})` }, { status: 400 })
    }

    const pageContent = await jinaRes.text()

    // Extract logo + color from raw HTML with multiple fallbacks
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
      if (ogImage?.[1]) {
        logoUrl = resolveUrl(ogImage[1], cleanUrl)
      }

      // 2. twitter:image fallback
      if (!logoUrl) {
        const twitterImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
          ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)
        if (twitterImage?.[1]) logoUrl = resolveUrl(twitterImage[1], cleanUrl)
      }

      // 3. apple-touch-icon fallback
      if (!logoUrl) {
        const appleIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
        if (appleIcon?.[1]) logoUrl = resolveUrl(appleIcon[1], cleanUrl)
      }

      // 4. favicon.ico fallback
      if (!logoUrl) {
        const faviconTag = html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i)
        if (faviconTag?.[1]) {
          logoUrl = resolveUrl(faviconTag[1], cleanUrl)
        } else {
          logoUrl = `${origin}/favicon.ico`
        }
      }

      // theme-color
      const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
      if (themeColor?.[1]) primaryColor = themeColor[1]

    } catch {
      // Silent fail — favicon.ico fallback
      logoUrl = `${origin}/favicon.ico`
    }

    // Use Claude Haiku to extract structured brand info
    const message = await getAnthropic().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Extract brand information from this website content. Return ONLY valid JSON with these fields:
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
      ],
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
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('scan-website error:', message)
    return NextResponse.json({ error: `Scan failed: ${message}` }, { status: 500 })
  }
}
