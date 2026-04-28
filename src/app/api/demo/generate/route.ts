import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Default avatar and voice for demos
const DEMO_AVATAR_ID = 'Abigail_expressive_2024112501'
const DEMO_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel

async function scanWebsite(website: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/onboarding/scan-website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: website }),
    })
    const data = await res.json()
    return data.data ?? null
  } catch {
    return null
  }
}

async function generateSocialPosts(brandData: Record<string, unknown>) {
  const message = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a social media expert. Based on this brand profile, write 5 social media posts — one for each platform: Instagram, Facebook, LinkedIn, X, and a general one. Make them specific to the brand, engaging, and platform-appropriate.

Brand: ${JSON.stringify(brandData)}

Return ONLY valid JSON array:
[
  { "platform": "Instagram", "content": "post text with emojis and hashtags" },
  { "platform": "Facebook", "content": "post text" },
  { "platform": "LinkedIn", "content": "professional post text" },
  { "platform": "X", "content": "short punchy post under 280 chars" },
  { "platform": "General", "content": "versatile post for any platform" }
]`,
    }],
  })
  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(jsonStr)
}

async function generateScripts(brandData: Record<string, unknown>) {
  const message = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a content strategist. Based on this brand profile, write:
1. A 2-minute podcast intro script (spoken naturally, ~300 words)
2. A 60-second AI presenter video script (~150 words)

Brand: ${JSON.stringify(brandData)}

Return ONLY valid JSON:
{
  "audioScript": "full podcast script here",
  "videoScript": "full video script here"
}`,
    }],
  })
  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(jsonStr)
}

async function renderAudio(script: string, demoId: string): Promise<string | null> {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) return null
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEMO_VOICE_ID}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const admin = createAdminClient()
    const path = `demos/${demoId}/podcast.mp3`
    const { error } = await admin.storage.from('content').upload(path, Buffer.from(buf), { contentType: 'audio/mpeg', upsert: true })
    if (error) return null
    const { data: { publicUrl } } = admin.storage.from('content').getPublicUrl(path)
    return publicUrl
  } catch {
    return null
  }
}

async function submitHeyGenVideo(script: string, demoId: string): Promise<string | null> {
  const key = process.env.HEYGEN_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: { 'X-Api-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_inputs: [{
          character: { type: 'avatar', avatar_id: DEMO_AVATAR_ID, avatar_style: 'normal' },
          voice: { type: 'text', input_text: script, voice_id: DEMO_VOICE_ID },
          background: { type: 'color', value: '#f8fafc' },
        }],
        dimension: { width: 1280, height: 720 },
        caption: false,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data?.video_id ?? null
  } catch {
    return null
  }
}

async function sendNotification(name: string, email: string, phone: string | null, demoId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resultsUrl = `${baseUrl}/demo/results/${demoId}`

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'PulseCommand <hello@pulsecommand.com>',
        to: email,
        subject: `${name}, your sample content is ready! 🎉`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Your sample content is ready, ${name}!</h1>
            <p style="color: #555;">We've generated real sample content for your brand — social posts, a podcast episode, and an AI presenter video.</p>
            <p style="color: #555;"><strong>⚡ Special offer:</strong> Sign up in the next hour and get 50% off your first month.</p>
            <a href="${resultsUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
              View My Sample Content →
            </a>
            <p style="color: #999; font-size: 12px;">PulseCommand · AI Marketing on Autopilot</p>
          </div>
        `,
      }),
    }).catch(() => {})
  }

  // SMS via Twilio if phone provided
  if (phone) {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER
    if (twilioSid && twilioToken && twilioFrom) {
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioFrom,
          To: phone,
          Body: `Hi ${name}! Your PulseCommand sample content is ready 🎉 View it here + claim 50% off your first month: ${resultsUrl}`,
        }),
      }).catch(() => {})
    }
  }
}

export async function POST(request: NextRequest) {
  const { demoId } = await request.json()
  if (!demoId) return NextResponse.json({ error: 'Missing demoId' }, { status: 400 })

  const admin = createAdminClient()

  try {
    const { data: demo } = await admin.from('demo_requests').select('*').eq('id', demoId).single()
    if (!demo) return NextResponse.json({ error: 'Demo not found' }, { status: 404 })

    await admin.from('demo_requests').update({ status: 'generating' }).eq('id', demoId)

    // 1. Scan website
    const brandData = await scanWebsite(demo.website)

    // 2. Generate social posts + scripts in parallel
    const [socialPosts, scripts] = await Promise.all([
      generateSocialPosts(brandData ?? { website: demo.website, name: demo.name }),
      generateScripts(brandData ?? { website: demo.website, name: demo.name }),
    ])

    // 3. Render audio + submit HeyGen video in parallel
    const [audioUrl, heygenVideoId] = await Promise.all([
      renderAudio(scripts.audioScript, demoId),
      submitHeyGenVideo(scripts.videoScript, demoId),
    ])

    // 4. Save everything
    await admin.from('demo_requests').update({
      status: 'done',
      brand_data: brandData,
      social_posts: socialPosts,
      audio_script: scripts.audioScript,
      audio_url: audioUrl,
      video_script: scripts.videoScript,
      heygen_video_id: heygenVideoId,
    }).eq('id', demoId)

    // 5. Notify user
    await sendNotification(demo.name, demo.email, demo.phone, demoId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('demo/generate error:', err)
    await admin.from('demo_requests').update({ status: 'error' }).eq('id', demoId)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
