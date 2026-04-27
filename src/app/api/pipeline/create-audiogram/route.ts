import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { episodeId, clientId, audioUrl } = await request.json()

    const supabase = await createClient()

    // Headliner API - create audiogram
    // Docs: https://api.headliner.app/
    const headlinerRes = await fetch('https://api.headliner.app/v1/audiograms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HEADLINER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        template: 'waveform',
        duration: 60, // 60-second preview clip for social
        output_format: 'mp4',
      }),
    })

    if (!headlinerRes.ok) {
      const errText = await headlinerRes.text()
      console.error('Headliner error:', errText)
      // Don't fail episode — audiogram is optional
      return NextResponse.json({ success: false, error: errText }, { status: 502 })
    }

    const headlinerData = await headlinerRes.json()
    const audiogramUrl = headlinerData.url ?? headlinerData.output_url

    // Update episode with audiogram URL
    await supabase.from('audio_episodes').update({
      audiogram_url: audiogramUrl,
      status: 'audiogram',
    }).eq('id', episodeId)

    // Log activity
    await supabase.from('activities').insert({
      client_id: clientId,
      type: 'content_published',
      title: 'Audiogram created',
      description: 'Ready to publish to social media via Ayrshare.',
      created_by: 'system',
    })

    return NextResponse.json({ success: true, audiogramUrl })
  } catch (err) {
    console.error('create-audiogram error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
