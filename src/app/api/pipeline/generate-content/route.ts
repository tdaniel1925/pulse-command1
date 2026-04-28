import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ContentType = 'social' | 'audio' | 'video'

interface GenerateContentBody {
  clientId: string
  type: ContentType
}

async function claudeText(prompt: string): Promise<string> {
  const message = await getAnthropic().messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })
  return message.content[0].type === 'text' ? message.content[0].text : ''
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

    const validTypes: ContentType[] = ['social', 'audio', 'video']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    const supabase = await createClient()
    const admin = createAdminClient()

    // Fetch client and brand profile
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { data: brandProfile } = await admin
      .from('brand_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single()

    const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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

        // Ensure a Predis brand exists for this client
        const existingPredisId = (brandProfile as any)?.metadata?.predis_brand_id as string | undefined
        let predisBrandId = existingPredisId

        if (!predisBrandId) {
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
            if (predisBrandId && client.brand_profile_id) {
              const existingMeta = (brandProfile as any)?.metadata ?? {}
              await admin.from('brand_profiles').update({
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

        const insertedPosts = []
        for (const platform of platforms) {
          const postRes = await fetch('https://brain.predis.ai/predis_api/v1/create_content/', {
            method: 'POST',
            headers: { 'Authorization': predisKey },
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
          const generated = postData.posts?.[0] ?? postData.data?.[0] ?? {}
          const content = generated.caption ?? generated.text ?? `Sample post for ${platform}`
          const imageUrl = generated.image_url ?? generated.media_url ?? null

          const { data: inserted } = await admin.from('social_posts').insert({
            client_id: clientId,
            status: 'draft',
            content,
            image_url: imageUrl,
            platforms: [platform],
          }).select('id').single()

          if (inserted) insertedPosts.push(inserted.id)
        }

        await admin.from('activities').insert({
          client_id: clientId,
          type: 'content_published',
          title: `${insertedPosts.length} sample post(s) generated via Predis`,
          description: `1 sample post per platform: ${platforms.join(', ')}`,
          created_by: 'system',
        })
        break
      }

      case 'audio': {
        let script = ''
        let status = 'pending'

        try {
          script = await claudeText(
            `You are a podcast script writer. Write a compelling 3-minute audio episode script (roughly 450 words) in first person for the business owner.

Business: ${brandProfile?.business_description ?? client.business_name}
Topic: Monthly update for ${month}
Tone: ${brandProfile?.tone_of_voice ?? 'conversational'}
Target audience: ${brandProfile?.target_audience ?? 'general audience'}

Write naturally as if speaking — no stage directions, no headers. Just the spoken words.`
          )
          status = 'script_ready'
        } catch (err) {
          console.error('Claude audio script error:', err)
          script = 'Script generation failed — will retry'
        }

        // TODO: trigger ElevenLabs TTS once voice clone is ready
        await admin.from('audio_episodes').insert({
          client_id: clientId,
          status,
          title: `Audio episode — ${month}`,
          script,
        })

        await admin.from('activities').insert({
          client_id: clientId,
          type: 'content_published',
          title: 'Audio episode script generated',
          description: status === 'script_ready' ? 'Script written by Claude Opus, pending ElevenLabs render' : 'Script generation failed',
          created_by: 'system',
        })
        break
      }

      case 'video': {
        let script = ''
        let status = 'pending'

        try {
          script = await claudeText(
            `You are a video script writer. Write a compelling 2-minute video script (roughly 300 words) in first person for the business owner. Include natural pauses marked with [pause] and emphasis with *word*.

Business: ${brandProfile?.business_description ?? client.business_name}
Topic: Monthly update for ${month}
Tone: ${brandProfile?.tone_of_voice ?? 'professional'}
Target audience: ${brandProfile?.target_audience ?? 'general audience'}

Write naturally as if speaking to camera.`
          )
          status = 'script_ready'
        } catch (err) {
          console.error('Claude video script error:', err)
          script = 'Script generation failed — will retry'
        }

        // TODO: submit script to HeyGen for avatar video rendering
        await admin.from('videos').insert({
          client_id: clientId,
          status,
          title: `Video — ${month}`,
          script,
        })

        await admin.from('activities').insert({
          client_id: clientId,
          type: 'content_published',
          title: 'Video script generated',
          description: status === 'script_ready' ? 'Script written by Claude Opus, pending HeyGen render' : 'Script generation failed',
          created_by: 'system',
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
