import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // Clean the URL
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`

    // Use Jina AI to scrape — no API key needed
    const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'markdown',
      },
    })

    if (!jinaRes.ok) {
      return NextResponse.json({ error: 'Could not scan website' }, { status: 400 })
    }

    const pageContent = await jinaRes.text()

    // Also try to get og:image and meta tags via a simple fetch of the raw HTML
    let logoUrl = ''
    let primaryColor = ''
    try {
      const htmlRes = await fetch(cleanUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000)
      })
      const html = await htmlRes.text()

      // Extract og:image
      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
        ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      if (ogImage?.[1]) logoUrl = ogImage[1]

      // Extract theme-color
      const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
      if (themeColor?.[1]) primaryColor = themeColor[1]
    } catch {
      // Silent fail — Jina content is enough
    }

    // Use OpenAI to extract structured brand info from the scraped content
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract brand information from this website content. Return ONLY valid JSON:
{
  "businessName": "string",
  "tagline": "string",
  "description": "string (1-2 sentences about what they do)",
  "industry": "string",
  "primaryColor": "string (hex color if you can infer it, else empty)",
  "toneOfVoice": "string (professional/casual/bold/warm/etc)"
}`
        },
        { role: 'user', content: pageContent.slice(0, 8000) }
      ],
      response_format: { type: 'json_object' }
    })

    const extracted = JSON.parse(completion.choices[0].message.content ?? '{}')

    return NextResponse.json({
      success: true,
      data: {
        ...extracted,
        logoUrl,
        primaryColor: primaryColor || extracted.primaryColor || '',
      }
    })
  } catch (err) {
    console.error('scan-website error:', err)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
