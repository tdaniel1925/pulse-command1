import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, business_name, brand_profile_id')
      .eq('subscription_status', 'active')

    if (clientsError) {
      console.error('Error fetching active clients:', clientsError)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({ success: true, clientsProcessed: 0 })
    }

    for (const client of clients) {
      console.log('Running monthly pipeline for client:', client.id)

      // Step 1: Generate social posts via Predis (150 posts)
      // TODO: implement Predis API call
      // await predis.generatePosts({ clientId: client.id, count: 150, brandProfileId: client.brand_profile_id })
      console.log('TODO: Generate 150 social posts via Predis for client:', client.id)

      // Step 2: Schedule posts via Ayrshare
      // TODO: implement Ayrshare scheduling
      // await ayrshare.schedulePosts({ clientId: client.id, posts })
      console.log('TODO: Schedule posts via Ayrshare for client:', client.id)

      // Step 3: Generate audio scripts via OpenAI
      // TODO: implement OpenAI audio script generation
      // const audioScripts = await openai.chat.completions.create({ ... })
      console.log('TODO: Generate audio scripts via OpenAI for client:', client.id)

      // Step 4: Render audio via ElevenLabs
      // TODO: implement ElevenLabs audio rendering
      // await elevenlabs.textToSpeech({ text: audioScript, voiceId: client.voice_id })
      console.log('TODO: Render audio via ElevenLabs for client:', client.id)

      // Step 5: Create audiogram via Headliner
      // TODO: implement Headliner audiogram creation
      // await headliner.createAudiogram({ audioUrl, imageUrl })
      console.log('TODO: Create audiogram via Headliner for client:', client.id)

      // Step 6: Generate video scripts via OpenAI
      // TODO: implement OpenAI video script generation
      // const videoScript = await openai.chat.completions.create({ ... })
      console.log('TODO: Generate video scripts via OpenAI for client:', client.id)

      // Step 7: Submit video to HeyGen (async — webhook handles completion)
      // TODO: implement HeyGen video submission
      // await heygen.submitVideo({ script: videoScript, avatarId: client.avatar_id })
      console.log('TODO: Submit video to HeyGen for client:', client.id)

      // Log activity
      await supabase.from('activities').insert({
        client_id: client.id,
        type: 'pipeline',
        title: 'Monthly content pipeline started',
        description: `Monthly content generation initiated for ${client.business_name ?? client.first_name}`,
      })
    }

    return NextResponse.json({ success: true, clientsProcessed: clients.length })
  } catch (error) {
    console.error('Monthly pipeline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
