import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Predis pushes this when a post finishes generating.
// Payload: { post_id, brand_id, status, urls, caption, hashtags, media_type }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Predis webhook received:', JSON.stringify(body).slice(0, 500))

    const admin = createAdminClient()

    const postId = body.post_id ?? body.id
    const status  = body.status
    // Predis returns urls[] array or single media_url
    const imageUrl = body.urls?.[0] ?? body.media_url ?? body.image_url ?? null
    const caption: string = body.caption ?? body.text ?? ''
    const hashtags: string[] = body.hashtags ?? []

    if (!postId) {
      return NextResponse.json({ received: true })
    }

    // Find the placeholder row we inserted in the weekly-social cron
    const { data: existingPost } = await admin
      .from('social_posts')
      .select('id, client_id, platforms')
      .filter('metadata->>predis_post_id', 'eq', postId)
      .maybeSingle()

    // Check client's auto_approve setting
    let autoApprove = true
    if (existingPost) {
      const { data: clientRow } = await admin
        .from('clients')
        .select('auto_approve')
        .eq('id', existingPost.client_id)
        .maybeSingle()
      autoApprove = clientRow?.auto_approve ?? true
    }

    if (status === 'failed') {
      console.error('Predis generation failed for post_id:', postId)
      if (existingPost) {
        await admin
          .from('social_posts')
          .update({ status: 'failed' })
          .eq('id', existingPost.id)
      }
      return NextResponse.json({ received: true })
    }

    // Build caption with hashtags
    const fullContent = hashtags.length > 0
      ? `${caption}\n\n${hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`
      : caption

    if (existingPost) {
      const newStatus = autoApprove ? 'scheduled' : 'pending_approval'

      // Update the placeholder with real content
      await admin
        .from('social_posts')
        .update({
          content: fullContent,
          image_url: imageUrl,
          status: newStatus,
        })
        .eq('id', existingPost.id)

      // Notify client via activity feed
      const activityTitle = autoApprove
        ? 'Social post scheduled'
        : 'Social post ready for approval'
      const activityDescription = autoApprove
        ? 'A new AI-generated social post has been automatically scheduled.'
        : 'A new AI-generated social post with image is ready for your review.'

      await admin.from('activities').insert({
        client_id: existingPost.client_id,
        type: 'post',
        title: activityTitle,
        description: activityDescription,
        created_by: 'system',
      } as never)

      console.log(`[predis webhook] Updated post ${existingPost.id} → ${newStatus} (auto_approve=${autoApprove})`)
    } else {
      // Fallback: no placeholder found — log for debugging
      console.warn(`[predis webhook] No matching social_post found for predis_post_id: ${postId}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Predis webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
