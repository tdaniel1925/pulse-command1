import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listZernioAccounts, postToZernio, zernioConfigured } from '@/lib/zernio'
import { sendPostPublishedEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

/**
 * Publish a social_post row to its target platforms via Zernio.
 * Looks up the client's Zernio profile, resolves the connected accounts for the
 * post's platforms, and publishes immediately (publishNow).
 */
export async function POST(req: NextRequest) {
  try {
    if (!zernioConfigured()) {
      return NextResponse.json({ error: 'Social posting is not configured' }, { status: 503 })
    }
    const { postId, scheduledFor } = (await req.json()) as { postId?: string; scheduledFor?: string }
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })
    const validScheduledFor = scheduledFor && !Number.isNaN(Date.parse(scheduledFor))
      ? new Date(scheduledFor).toISOString()
      : undefined

    const admin = createAdminClient()

    const { data: post } = await admin
      .from('social_posts')
      .select('id, client_id, content, platforms, image_url, metadata')
      .eq('id', postId)
      .single()
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    // Resolve the client's Zernio profile.
    let profileId: string | null = null
    let businessName = 'Your Business'
    let clientEmail: string | null = null
    try {
      const { data: client } = await admin
        .from('clients')
        .select('zernio_profile_id, business_name, email')
        .eq('id', post.client_id)
        .single()
      profileId = (client?.zernio_profile_id as string | null) ?? null
      businessName = (client?.business_name as string | null) ?? businessName
      clientEmail = (client?.email as string | null) ?? null
    } catch {
      profileId = null
    }
    if (!profileId) {
      return NextResponse.json({ error: 'Client has not connected social accounts yet' }, { status: 400 })
    }

    // Map the post's requested platforms to actual connected accounts.
    const requested = (Array.isArray(post.platforms) ? post.platforms : []).map((p: string) => p.toLowerCase())
    const accounts = await listZernioAccounts(profileId)
    const captions = (post.metadata as { captions?: Record<string, string> } | null)?.captions ?? {}

    const targets = accounts
      .filter((a) => a.isActive && requested.includes(a.platform.toLowerCase()))
      .map((a) => ({
        platform: a.platform,
        accountId: a.id,
        customContent: captions[a.platform] ?? undefined,
      }))

    if (!targets.length) {
      return NextResponse.json({ error: 'No connected accounts match this post\'s platforms' }, { status: 400 })
    }

    const scheduling = Boolean(validScheduledFor)
    let result
    try {
      result = await postToZernio({
        content: post.content ?? '',
        targets,
        mediaUrls: post.image_url ? [post.image_url] : undefined,
        scheduledFor: validScheduledFor,
        publishNow: !scheduling,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[zernio/publish] failed:', msg)
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const platformNames = [...new Set(targets.map((t) => t.platform))]

    // If scheduled for the future, Zernio publishes at that time → mark
    // "scheduled". Otherwise it's live now → "published".
    const update = scheduling
      ? { status: 'scheduled', scheduled_at: validScheduledFor!, zernio_post_id: result.id }
      : { status: 'published', published_at: new Date().toISOString(), zernio_post_id: result.id }
    const { error: updErr } = await admin.from('social_posts').update(update).eq('id', postId)
    if (updErr) {
      const fallback: Record<string, unknown> = { ...update }
      delete fallback.zernio_post_id
      await admin.from('social_posts').update(fallback).eq('id', postId)
    }

    await admin.from('activities').insert({
      client_id: post.client_id,
      type: 'post',
      title: 'Social post published',
      description: `Published to ${platformNames.join(', ')}.`,
      created_by: 'system',
    } as never)

    await createNotification({
      clientId: post.client_id,
      type: 'post_published',
      title: 'Your post is live!',
      body: `Published to ${platformNames.join(', ')}.`,
      link: '/dashboard/social',
    }).catch(() => {})

    if (clientEmail) {
      try {
        await sendPostPublishedEmail({
          to: clientEmail,
          businessName,
          platforms: platformNames,
          imageUrl: post.image_url,
        })
      } catch (emailErr) {
        console.error('[zernio/publish] email failed:', emailErr instanceof Error ? emailErr.message : emailErr)
      }
    }

    return NextResponse.json({ ok: true, postId: result.id, platforms: platformNames })
  } catch (err) {
    console.error('[zernio/publish]', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
