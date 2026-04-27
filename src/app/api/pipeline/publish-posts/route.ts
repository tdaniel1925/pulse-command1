import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { postIds, clientId } = await request.json()

    if (!postIds?.length || !clientId) {
      return NextResponse.json({ error: 'postIds and clientId required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch the posts to publish
    const { data: posts } = await supabase
      .from('social_posts')
      .select('*')
      .in('id', postIds)
      .eq('client_id', clientId)

    if (!posts?.length) {
      return NextResponse.json({ error: 'No posts found' }, { status: 404 })
    }

    const results = []

    for (const post of posts) {
      try {
        const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : []

        // Ayrshare API call
        const ayrshareRes = await fetch('https://api.ayrshare.com/api/post', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post: post.content,
            platforms: platforms.map(p => p.toLowerCase()),
            scheduleDate: post.scheduled_at ?? undefined,
            mediaUrls: post.image_url ? [post.image_url] : undefined,
            videoUrl: post.video_url ?? undefined,
          }),
        })

        if (!ayrshareRes.ok) {
          const errText = await ayrshareRes.text()
          console.error('Ayrshare error for post', post.id, errText)
          await supabase.from('social_posts').update({ status: 'failed' }).eq('id', post.id)
          results.push({ id: post.id, success: false, error: errText })
          continue
        }

        const ayrshareData = await ayrshareRes.json()

        // Update post with Ayrshare post ID and status
        await supabase.from('social_posts').update({
          status: post.scheduled_at ? 'scheduled' : 'published',
          ayrshare_post_id: ayrshareData.id ?? ayrshareData.postId ?? null,
          published_at: post.scheduled_at ? null : new Date().toISOString(),
        }).eq('id', post.id)

        results.push({ id: post.id, success: true, ayrshareId: ayrshareData.id })
      } catch (err) {
        console.error('Error publishing post', post.id, err)
        await supabase.from('social_posts').update({ status: 'failed' }).eq('id', post.id)
        results.push({ id: post.id, success: false })
      }
    }

    // Log activity
    const successCount = results.filter(r => r.success).length
    await supabase.from('activities').insert({
      client_id: clientId,
      type: 'content_published',
      title: `${successCount} post(s) sent to Ayrshare for publishing`,
      description: `${results.filter(r => !r.success).length} failed`,
      created_by: 'admin',
    })

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('publish-posts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
