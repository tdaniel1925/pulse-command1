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
        const platforms: string[] = Array.isArray(brandProfile?.priority_channels)
          ? (brandProfile.priority_channels as string[])
          : ['Instagram', 'Facebook', 'LinkedIn']

        const predisKey = process.env.PREDIS_API_KEY

        if (!predisKey) {
          console.log('PREDIS_API_KEY not set — skipping Predis')
          break
        }

        // Step 1: Ensure a Predis brand exists for this client
        // Store predis_brand_id in brand_profiles metadata
        const existingPredisId = (brandProfile as any)?.metadata?.predis_brand_id as string | undefined
        let predisBrandId = existingPredisId

        if (!predisBrandId) {
          // Create brand in Predis
          const brandForm = new FormData()
          brandForm.append('brand_name', client.business_name)
          if (brandProfile?.logo_url) brandForm.append('logo_url', brandProfile.logo_url)
          if (brandProfile?.primary_color) brandForm.append('primary_color', brandProfile.primary_color)
          if (brandProfile?.secondary_color) brandForm.append('secondary_color', brandProfile.secondary_color)
          if (brandProfile?.business_description) brandForm.append('brand_description', brandProfile.business_description)
          if (brandProfile?.target_audience) brandForm.append('target_audience', brandProfile.target_audience)

          const brandRes = await fetch('https://brain.predis.ai/predis_api/v1/add_brand/', {
            method: 'POST',
            headers: { 'Authorization': predisKey },
            body: brandForm,
          })

          if (brandRes.ok) {
            const brandData = await brandRes.json()
            predisBrandId = brandData.brand_id ?? brandData.id
            // Save predis_brand_id to brand_profiles metadata
            if (predisBrandId && client.brand_profile_id) {
              const existingMeta = (brandProfile as any)?.metadata ?? {}
              await supabase.from('brand_profiles').update({
                metadata: { ...existingMeta, predis_brand_id: predisBrandId },
              } as any).eq('id', client.brand_profile_id)
            }
          } else {
            console.error('Predis create brand error:', await brandRes.text())
          }
        }

        if (!predisBrandId) {
          console.error('Could not get Predis brand ID — skipping post generation')
          break
        }

        // Step 2: Generate 1 sample post per priority platform
        const insertedPosts = []
        for (const platform of platforms) {
          const postRes = await fetch('https://brain.predis.ai/predis_api/v1/create_content/', {
            method: 'POST',
            headers: { 'Authorization': predisKey },
            // Predis requires form-data
          body: (() => {
              const f = new FormData()
              f.append('brand_id', predisBrandId!)
              f.append('text', `Create 1 engaging ${platform} post for ${client.business_name}. Topic: ${(brandProfile?.content_pillars as string[] ?? ['business value'])[0]}. Tone: ${brandProfile?.tone_of_voice ?? 'professional'}. Target audience: ${brandProfile?.target_audience ?? 'general audience'}. Include relevant hashtags.`)
              f.append('media_type', 'single_image')
              f.append('model_version', '4')
              return f
            })(),
          })

          if (!postRes.ok) {
            console.error(`Predis post error for ${platform}:`, await postRes.text())
            continue
          }

          const postData = await postRes.json()
          // Predis returns generated posts — extract content and image
          const generated = postData.posts?.[0] ?? postData.data?.[0] ?? {}
          const content = generated.caption ?? generated.text ?? `Sample post for ${platform}`
          const imageUrl = generated.image_url ?? generated.media_url ?? null

          const { data: inserted } = await supabase.from('social_posts').insert({
            client_id: clientId,
            status: 'draft',
            content,
            image_url: imageUrl,
            platforms: [platform],
          }).select('id').single()

          if (inserted) insertedPosts.push(inserted.id)
        }

        await supabase.from('activities').insert({
          client_id: clientId,
          type: 'content_published',
          title: `${insertedPosts.length} sample post(s) generated via Predis`,
          description: `1 sample post per platform: ${platforms.join(', ')}. Pending client approval.`,
          created_by: 'system',
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
