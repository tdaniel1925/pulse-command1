import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

type ContentType = 'social' | 'audio' | 'video' | 'landing-page'

interface GenerateContentBody {
  clientId: string
  type: ContentType
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentBody = await request.json()
    const { clientId, type } = body

    if (!clientId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId and type' },
        { status: 400 }
      )
    }

    const validTypes: ContentType[] = ['social', 'audio', 'video', 'landing-page']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch client and brand profile
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single()

    const openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null

    switch (type) {
      case 'social': {
        // Predis.ai API - generate social posts
        // Note: Predis generates content asynchronously; the webhook at /api/webhooks/predis
        // will update these rows when content is ready.
        if (process.env.PREDIS_API_KEY) {
          const predisResponse = await fetch('https://brain.predis.ai/predis_api/v1/create_content/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.PREDIS_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              brand_id: client?.brand_profile_id,
              text: `Create 5 engaging social media posts for: ${brandProfile?.businessDescription ?? 'this business'}.
           Tone: ${brandProfile?.toneOfVoice ?? 'professional'}.
           Target audience: ${brandProfile?.targetAudience ?? 'general audience'}.
           Content pillars: ${(brandProfile?.contentPillars as string[] ?? []).join(', ')}.`,
              num_results: 5,
            })
          })

          if (!predisResponse.ok) {
            console.error('Predis API error:', await predisResponse.text())
            // Fall through — insert draft posts below
          }
        } else {
          console.log('PREDIS_API_KEY not set — skipping Predis API call, inserting draft posts')
        }

        // TODO: Predis webhook at /api/webhooks/predis will update these rows when async generation completes
        const draftPosts = Array.from({ length: 5 }, (_, i) => ({
          client_id: clientId,
          status: 'draft',
          content: `Draft social post ${i + 1} for ${client.business_name ?? 'client'} — content pending generation`,
          platform: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'TikTok'][i],
        }))

        const { error: postsError } = await supabase.from('social_posts').insert(draftPosts)
        if (postsError) console.error('Error inserting draft social posts:', postsError)

        await supabase.from('activities').insert({
          client_id: clientId,
          type: 'content',
          title: 'Social posts generation triggered',
          description: '5 draft social posts created, pending Predis generation',
        })
        break
      }

      case 'audio': {
        let script = 'Script pending OpenAI generation'
        let status = 'draft'

        if (openai) {
          // Generate audio script with OpenAI
          const scriptCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a podcast script writer. Write a compelling 3-minute audio episode script (roughly 450 words) in first person for the business owner.'
              },
              {
                role: 'user',
                content: `Business: ${brandProfile?.businessDescription}. Topic: Monthly update for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Tone: ${brandProfile?.toneOfVoice ?? 'conversational'}.`
              }
            ]
          })
          script = scriptCompletion.choices[0].message.content ?? ''
          status = 'script_ready'
        } else {
          console.log('OPENAI_API_KEY not set — skipping script generation')
        }

        // TODO: trigger ElevenLabs TTS once voice clone is ready
        const { error: audioError } = await supabase.from('audio_episodes').insert({
          client_id: clientId,
          status,
          title: `Audio episode — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          script,
        })
        if (audioError) console.error('Error inserting audio episode:', audioError)

        await supabase.from('activities').insert({
          client_id: clientId,
          type: 'content',
          title: 'Audio episode generation triggered',
          description: status === 'script_ready' ? 'Script generated by OpenAI, pending ElevenLabs render' : 'Audio script and rendering queued',
        })
        break
      }

      case 'video': {
        let script = 'Script pending OpenAI generation'
        let status = 'pending'

        if (openai) {
          // Generate video script with OpenAI
          const scriptCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a video script writer. Write a compelling 2-minute video script (roughly 300 words) in first person for the business owner. Include natural pauses and emphasis cues.'
              },
              {
                role: 'user',
                content: `Business: ${brandProfile?.businessDescription}. Topic: Monthly update for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Tone: ${brandProfile?.toneOfVoice ?? 'professional'}.`
              }
            ]
          })
          script = scriptCompletion.choices[0].message.content ?? ''
          status = 'script_ready'
        } else {
          console.log('OPENAI_API_KEY not set — skipping video script generation')
        }

        // TODO: submit script to HeyGen for avatar video rendering
        // HeyGen generates asynchronously — webhook at /api/webhooks/heygen handles completion
        const { error: videoError } = await supabase.from('videos').insert({
          client_id: clientId,
          status,
          title: `Video — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          script,
        })
        if (videoError) console.error('Error inserting video record:', videoError)

        await supabase.from('activities').insert({
          client_id: clientId,
          type: 'content',
          title: 'Video generation triggered',
          description: status === 'script_ready' ? 'Script generated by OpenAI, pending HeyGen render' : 'Video script and HeyGen rendering queued',
        })
        break
      }

      case 'landing-page': {
        // TODO: generate HTML landing page via OpenAI
        // TODO: deploy via GitHub + Vercel
        console.log('TODO: Generate landing page HTML via OpenAI for client:', clientId)
        console.log('TODO: Deploy landing page via GitHub/Vercel for client:', clientId)

        const { error: pageError } = await supabase.from('landing_pages').insert({
          client_id: clientId,
          status: 'draft',
          title: `Landing page for ${client.business_name ?? 'client'}`,
          html_content: '<!-- HTML pending generation -->',
        })
        if (pageError) console.error('Error inserting landing page record:', pageError)

        await supabase.from('activities').insert({
          client_id: clientId,
          type: 'content',
          title: 'Landing page generation triggered',
          description: 'Landing page generation and deployment queued',
        })
        break
      }
    }

    return NextResponse.json({ success: true, type })
  } catch (error) {
    console.error('Generate content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
