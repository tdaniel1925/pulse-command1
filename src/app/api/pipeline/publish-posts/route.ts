import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listZernioAccounts, postToZernio, zernioConfigured } from '@/lib/zernio'

export async function POST(request: NextRequest) {
  try {
    const { postIds, clientId } = await request.json()

    if (!postIds?.length || !clientId) {
      return NextResponse.json({ error: 'postIds and clientId required' }, { status: 400 })
    }
    if (!zernioConfigured()) {
      console.error('ZERNIO_API_KEY not set')
      return NextResponse.json({ error: 'Zernio not configured' }, { status: 503 })
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

    // Resolve the client's Zernio profile + connected accounts once.
    let profileId: string | null = null
    try {
      const { data: client } = await admin
        .from('clients')
        .select('zernio_profile_id')
        .eq('id', clientId)
        .single()
      profileId = (client?.zernio_profile_id as string | null) ?? null
    } catch {
      profileId = null
    }
    if (!profileId) {
      return NextResponse.json({ error: 'Client has not connected social accounts' }, { status: 400 })
    }
    const accounts = (await listZernioAccounts(profileId)).filter((a) => a.isActive)

    const results = []

    for (const post of posts) {
      try {
        const requested: string[] = (Array.isArray(post.platforms) ? post.platforms : []).map((p: string) => p.toLowerCase())
        const captions = (post.metadata as { captions?: Record<string, string> } | null)?.captions ?? {}
        const targets = accounts
          .filter((a) => requested.includes(a.platform.toLowerCase()))
          .map((a) => ({ platform: a.platform, accountId: a.id, customContent: captions[a.platform] }))

        if (!targets.length) {
          await admin.from('social_posts').update({ status: 'failed' }).eq('id', post.id)
          results.push({ id: post.id, success: false, error: 'no matching connected accounts' })
          continue
        }

        const result = await postToZernio({
          content: post.content ?? '',
          targets,
          mediaUrls: post.image_url ? [post.image_url] : undefined,
          scheduledFor: post.scheduled_at ?? undefined,
          publishNow: !post.scheduled_at,
        })

        const update = {
          status: post.scheduled_at ? 'scheduled' : 'published',
          zernio_post_id: result.id,
          published_at: post.scheduled_at ? null : new Date().toISOString(),
        }
        const { error: updErr } = await admin.from('social_posts').update(update).eq('id', post.id)
        if (updErr) {
          const fallback: Record<string, unknown> = { ...update }
          delete fallback.zernio_post_id
          await admin.from('social_posts').update(fallback).eq('id', post.id)
        }

        results.push({ id: post.id, success: true })
      } catch (err) {
        console.error('Error publishing post', post.id, err)
        await admin.from('social_posts').update({ status: 'failed' }).eq('id', post.id)
        results.push({ id: post.id, success: false })
      }
    }

    const successCount = results.filter((r) => r.success).length
    await admin.from('activities').insert({
      client_id: clientId,
      type: 'post',
      title: `${successCount} post(s) published`,
      description: `${results.filter((r) => !r.success).length} failed.`,
      created_by: 'system',
    })

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('publish-posts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
