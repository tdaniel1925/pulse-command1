import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { episodeId, clientId } = await request.json()

    const supabase = await createClient()

    const { data: episode } = await supabase
      .from('audio_episodes')
      .select('*')
      .eq('id', episodeId)
      .eq('client_id', clientId)
      .single()

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }

    // Get voice ID from brand profile
    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single()

    const voiceId = (brandProfile as any)?.metadata?.elevenlabs_voice_id ?? process.env.ELEVENLABS_DEFAULT_VOICE_ID ?? ''

    // ElevenLabs TTS API
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
      await supabase.from('audio_episodes').update({ status: 'failed' }).eq('id', episodeId)
      return NextResponse.json({ error: 'ElevenLabs API error', detail: errText }, { status: 502 })
    }

    // Upload audio to Supabase Storage
    const audioBuffer = await elevenRes.arrayBuffer()
    const fileName = `audio/${clientId}/${episodeId}.mp3`

    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('content').getPublicUrl(fileName)

    // Update episode
    await supabase.from('audio_episodes').update({
      status: 'ready',
      url: publicUrl,
      elevenlabs_audio_id: episodeId,
    }).eq('id', episodeId)

    // Log activity
    await supabase.from('activities').insert({
      client_id: clientId,
      type: 'content_published',
      title: `Audio episode rendered: ${episode.title}`,
      description: 'ElevenLabs TTS complete. Ready for audiogram creation.',
      created_by: 'system',
    })

    // TODO: Trigger Headliner audiogram creation next
    // POST to /api/pipeline/create-audiogram with { episodeId, clientId, audioUrl: publicUrl }

    return NextResponse.json({ success: true, audioUrl: publicUrl })
  } catch (err) {
    console.error('render-audio error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
