import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPodcast, pollUntilDone } from '@/lib/autocontent'

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

    if (!process.env.AUTOCONTENT_API_KEY) {
      console.error('AUTOCONTENT_API_KEY not set')
      await admin.from('audio_episodes').update({ status: 'failed' }).eq('id', episodeId)
      return NextResponse.json({ error: 'AutoContent API not configured' }, { status: 400 })
    }

    // Create podcast via AutoContent (full 2-host episode)
    const req = await createPodcast({
      text: episode.script ?? '',
      duration: 'medium',
    })

    // Poll until done (max 5 min)
    const result = await pollUntilDone(req.request_id, {
      maxWaitMs: 300_000,
      intervalMs: 10_000,
    })

    if (!result.audioUrl) {
      await admin.from('audio_episodes').update({ status: 'failed' }).eq('id', episodeId)
      return NextResponse.json({ error: 'No audio URL returned' }, { status: 502 })
    }

    await admin.from('audio_episodes').update({
      status: 'ready',
      url: result.audioUrl,
    }).eq('id', episodeId)

    await admin.from('activities').insert({
      client_id: clientId,
      type: 'audio',
      title: `Podcast episode ready: ${episode.title}`,
      description: 'AI podcast generated via AutoContent. Available to listen in your dashboard.',
      created_by: 'system',
    })

    return NextResponse.json({ success: true, audioUrl: result.audioUrl, shareUrl: result.shareUrl })
  } catch (err) {
    console.error('render-audio error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
