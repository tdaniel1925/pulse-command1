import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Predis sends a webhook when async content generation is complete
// Payload: { post_id, brand_id, status, media_url, caption, hashtags }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Predis webhook received:', JSON.stringify(body).slice(0, 500))

    const admin = createAdminClient()

    const postId = body.post_id ?? body.id
    const brandId = body.brand_id
    const status = body.status
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
    const { data: profiles } = await admin
      .from('brand_profiles')
      .select('client_id, metadata')

    const profile = profiles?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Insert as pending_approval so client can review before scheduling
    await admin.from('social_posts').insert({
      client_id: clientId,
      status: 'pending_approval',
      content: fullContent,
      image_url: mediaUrl,
      platforms: ['instagram', 'facebook', 'linkedin'],
    })

    // Log activity
    await admin.from('activities').insert({
      client_id: clientId,
      type: 'post',
      title: 'Social post ready for approval',
      description: 'AI-generated social post with image is ready for your review.',
      created_by: 'system',
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Predis webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
