import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const DEMO_AVATAR_ID = 'Abigail_expressive_2024112501'
const DEMO_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel

export async function POST(request: NextRequest) {
  try {
    const { demoId } = await request.json()
    if (!demoId) return NextResponse.json({ error: 'Missing demoId' }, { status: 400 })

    const admin = createAdminClient()
    const { data: demo } = await admin
      .from('demo_requests')
      .select('id, video_script, email_verified')
      .eq('id', demoId)
      .single()

    if (!demo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!demo.email_verified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
    if (!demo.video_script) return NextResponse.json({ error: 'No video script' }, { status: 400 })

    const key = process.env.HEYGEN_API_KEY
    if (!key) return NextResponse.json({ error: 'HeyGen not configured' }, { status: 500 })

    const res = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: { 'X-Api-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_inputs: [{
          character: { type: 'avatar', avatar_id: DEMO_AVATAR_ID, avatar_style: 'normal' },
          voice: { type: 'text', input_text: demo.video_script, voice_id: DEMO_VOICE_ID },
          background: { type: 'color', value: '#f8fafc' },
        }],
        dimension: { width: 1280, height: 720 },
        caption: false,
      }),
    })

    if (!res.ok) return NextResponse.json({ error: 'HeyGen error' }, { status: 500 })
    const data = await res.json()
    const videoId = data.data?.video_id

    if (videoId) {
      await admin.from('demo_requests').update({ heygen_video_id: videoId }).eq('id', demoId)
    }

    return NextResponse.json({ success: true, videoId })
  } catch (err) {
    console.error('demo/render-video error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
