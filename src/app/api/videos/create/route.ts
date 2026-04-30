import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const avatarMap: Record<string, string> = {
  alex: process.env.HEYGEN_AVATAR_ALEX ?? 'default_avatar_1',
  sarah: process.env.HEYGEN_AVATAR_SARAH ?? 'default_avatar_2',
  marcus: process.env.HEYGEN_AVATAR_MARCUS ?? 'default_avatar_3',
  priya: process.env.HEYGEN_AVATAR_PRIYA ?? 'default_avatar_4',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topic, script, avatarId, aspectRatio } = await request.json()
    if (!topic || !script) {
      return NextResponse.json({ error: 'topic and script are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: client } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const heygenApiKey = process.env.HEYGEN_API_KEY

    // Demo mode if no API key
    if (!heygenApiKey) {
      const { data: videoRow, error: insertErr } = await admin
        .from('videos')
        .insert({
          client_id: client.id,
          title: topic,
          status: 'demo',
          heygen_video_id: null,
          metadata: { demo: true, note: 'HEYGEN_API_KEY not configured', avatarId, aspectRatio },
        })
        .select('id')
        .single()

      if (insertErr) {
        console.error('[videos/create] insert error:', insertErr)
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }

      await admin.from('activities').insert({
        client_id: client.id,
        type: 'video',
        title: 'Video generation started (demo)',
        description: `Demo video created for: ${topic}`,
        created_by: user.id,
      })

      return NextResponse.json({ id: videoRow.id })
    }

    // Call HeyGen
    const resolvedAvatarId = avatarMap[avatarId] ?? avatarMap['alex']
    const dimension =
      aspectRatio === '9:16'
        ? { width: 720, height: 1280 }
        : { width: 1280, height: 720 }

    const heygenRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': heygenApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: resolvedAvatarId,
              avatar_style: 'normal',
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: 'en-US-JennyNeural',
            },
            background: { type: 'color', value: '#FFFFFF' },
          },
        ],
        dimension,
        aspect_ratio: aspectRatio,
      }),
    })

    let heygenVideoId: string | null = null

    if (heygenRes.ok) {
      const heygenData = await heygenRes.json()
      heygenVideoId = heygenData.data?.video_id ?? heygenData.video_id ?? null
    } else {
      const errText = await heygenRes.text()
      console.error('[videos/create] HeyGen error:', errText)
    }

    const { data: videoRow, error: insertErr } = await admin
      .from('videos')
      .insert({
        client_id: client.id,
        title: topic,
        status: 'processing',
        heygen_video_id: heygenVideoId,
        metadata: { avatarId, aspectRatio },
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[videos/create] insert error:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    await admin.from('activities').insert({
      client_id: client.id,
      type: 'video',
      title: 'Video generation started',
      description: `HeyGen video queued for: ${topic}`,
      created_by: user.id,
    })

    return NextResponse.json({ id: videoRow.id })
  } catch (err) {
    console.error('[videos/create] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
