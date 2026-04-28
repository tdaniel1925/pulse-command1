import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { episodeId, clientId } = await request.json()
    const admin = createAdminClient()

    const { data: episode } = await admin
      .from('audio_episodes')
      .select('*')
      .eq('id', episodeId)
      .eq('client_id', clientId)
      .single()

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }

    const { data: brandProfile } = await admin
      .from('brand_profiles')
      .select('elevenlabs_voice_id')
      .eq('client_id', clientId)
      .single()

    const voiceId = brandProfile?.elevenlabs_voice_id ?? process.env.ELEVENLABS_DEFAULT_VOICE_ID ?? ''

    if (!voiceId) {
      console.error('No ElevenLabs voice ID for client:', clientId)
      await admin.from('audio_episodes').update({ status: 'failed' }).eq('id', episodeId)
      return NextResponse.json({ error: 'No voice ID configured' }, { status: 400 })
    }

    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: episode.script ?? '',
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!elevenRes.ok) {
      const errText = await elevenRes.text()
      console.error('ElevenLabs error:', errText)
      await admin.from('audio_episodes').update({ status: 'failed' }).eq('id', episodeId)
      return NextResponse.json({ error: 'ElevenLabs API error', detail: errText }, { status: 502 })
    }

    const audioBuffer = await elevenRes.arrayBuffer()
    const fileName = `audio/${clientId}/${episodeId}.mp3`

    const { error: uploadError } = await admin.storage
      .from('content')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('content').getPublicUrl(fileName)

    await admin.from('audio_episodes').update({
      status: 'ready',
      url: publicUrl,
    }).eq('id', episodeId)

    await admin.from('activities').insert({
      client_id: clientId,
      type: 'audio',
      title: `Audio episode ready: ${episode.title}`,
      description: 'ElevenLabs TTS complete. Available to listen in your dashboard.',
      created_by: 'system',
    })

    return NextResponse.json({ success: true, audioUrl: publicUrl })
  } catch (err) {
    console.error('render-audio error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
