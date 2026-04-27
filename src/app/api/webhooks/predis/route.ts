import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Predis sends a webhook when async content generation is complete
// Payload: { post_id, brand_id, status, media_url, caption, hashtags }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Predis webhook received:', JSON.stringify(body).slice(0, 500))

    const supabase = await createClient()

    // Predis webhook payload structure
    const postId = body.post_id ?? body.id
    const brandId = body.brand_id
    const status = body.status // 'completed' or 'failed'
    const mediaUrl = body.media_url ?? body.image_url ?? null
    const caption = body.caption ?? body.text ?? ''
    const hashtags: string[] = body.hashtags ?? []

    if (!brandId) {
      return NextResponse.json({ received: true })
    }

    if (status === 'failed') {
      console.error('Predis generation failed for post:', postId)
      return NextResponse.json({ received: true })
    }

    // Find the client by predis_brand_id stored in brand_profiles metadata
    const { data: profiles } = await supabase
      .from('brand_profiles')
      .select('client_id, metadata')

    const profile = profiles?.find(
      (p) => (p.metadata as any)?.predis_brand_id === brandId
    )

    if (!profile) {
      console.log('No client found for Predis brand_id:', brandId)
      return NextResponse.json({ received: true })
    }

    const clientId = profile.client_id

    // Build full content with hashtags
    const fullContent = hashtags.length > 0
      ? `${caption}\n\n${hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`
      : caption

    // Update existing draft post or insert new one
    // Try to find an existing draft post for this client with no image yet
    const { data: existingDraft } = await supabase
      .from('social_posts')
      .select('id')
      .eq('client_id', clientId)
      .eq('status', 'draft')
      .is('image_url', null)
      .limit(1)
      .single()

    if (existingDraft) {
      await supabase.from('social_posts').update({
        content: fullContent,
        image_url: mediaUrl,
      }).eq('id', existingDraft.id)
    } else {
      await supabase.from('social_posts').insert({
        client_id: clientId,
        status: 'draft',
        content: fullContent,
        image_url: mediaUrl,
        platforms: ['Instagram'],
      })
    }

    // Log activity
    await supabase.from('activities').insert({
      client_id: clientId,
      type: 'content_published',
      title: 'Predis post generated',
      description: 'AI-generated social post with image is ready for review.',
      created_by: 'system',
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Predis webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
