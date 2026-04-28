import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { postIds, clientId } = await request.json()

    if (!postIds?.length || !clientId) {
      return NextResponse.json({ error: 'postIds and clientId required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: posts } = await admin
      .from('social_posts')
      .select('*')
      .in('id', postIds)
      .eq('client_id', clientId)

    if (!posts?.length) {
      return NextResponse.json({ error: 'No posts found' }, { status: 404 })
    }

    const ayrshareKey = process.env.AYRSHARE_API_KEY
    if (!ayrshareKey) {
      console.error('AYRSHARE_API_KEY not set')
      return NextResponse.json({ error: 'Ayrshare not configured' }, { status: 500 })
    }

    const results = []

    for (const post of posts) {
      try {
        const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : []

        const ayrshareRes = await fetch('https://api.ayrshare.com/api/post', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ayrshareKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post: post.content,
            platforms: platforms.map((p: string) => p.toLowerCase()),
            ...(post.scheduled_at ? { scheduleDate: post.scheduled_at } : {}),
            ...(post.image_url ? { mediaUrls: [post.image_url] } : {}),
            ...(post.video_url ? { videoUrl: post.video_url } : {}),
          }),
        })

        if (!ayrshareRes.ok) {
          const errText = await ayrshareRes.text()
          console.error('Ayrshare error for post', post.id, errText)
          await admin.from('social_posts').update({ status: 'failed' }).eq('id', post.id)
          results.push({ id: post.id, success: false, error: errText })
          continue
        }

        const ayrshareData = await ayrshareRes.json()

        await admin.from('social_posts').update({
          status: post.scheduled_at ? 'scheduled' : 'published',
          ayrshare_post_id: ayrshareData.id ?? ayrshareData.postId ?? null,
          published_at: post.scheduled_at ? null : new Date().toISOString(),
        }).eq('id', post.id)

        results.push({ id: post.id, success: true })
      } catch (err) {
        console.error('Error publishing post', post.id, err)
        await admin.from('social_posts').update({ status: 'failed' }).eq('id', post.id)
        results.push({ id: post.id, success: false })
      }
    }

    const successCount = results.filter(r => r.success).length
    await admin.from('activities').insert({
      client_id: clientId,
      type: 'post',
      title: `${successCount} post(s) sent to Ayrshare`,
      description: `${results.filter(r => !r.success).length} failed.`,
      created_by: 'system',
    })

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('publish-posts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
