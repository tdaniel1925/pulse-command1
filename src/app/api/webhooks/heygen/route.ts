import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface HeyGenEventData {
  video_id: string
  video_url: string
  status: string
}

interface HeyGenWebhookPayload {
  event_type: string
  event_data: HeyGenEventData
}

export async function POST(request: NextRequest) {
  try {
    const payload: HeyGenWebhookPayload = await request.json()
    const { event_type, event_data } = payload

    if (event_type !== 'avatar_video.success') {
      console.log('Ignoring HeyGen event type:', event_type)
      return NextResponse.json({ received: true })
    }

    const { video_id, video_url, status } = event_data
    console.log('HeyGen video completed:', video_id, status)

    const supabase = await createClient()

    // Find asset by external_id
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id, client_id')
      .eq('external_id', video_id)
      .single()

    if (assetError || !asset) {
      console.log('No asset found for HeyGen video_id:', video_id)
      return NextResponse.json({ received: true })
    }

    // Update asset status
    const { error: assetUpdateError } = await supabase
      .from('assets')
      .update({ status: 'ready', url: video_url })
      .eq('id', asset.id)

    if (assetUpdateError) console.error('Error updating asset:', assetUpdateError)

    // Update videos table record
    const { error: videoUpdateError } = await supabase
      .from('videos')
      .update({ status: 'ready', url: video_url })
      .eq('heygen_video_id', video_id)

    if (videoUpdateError) console.error('Error updating video record:', videoUpdateError)

    // Log activity for the client
    if (asset.client_id) {
      await supabase.from('activities').insert({
        client_id: asset.client_id,
        type: 'video',
        title: 'HeyGen video ready',
        description: `Video ${video_id} has been rendered and is ready`,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('HeyGen webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
