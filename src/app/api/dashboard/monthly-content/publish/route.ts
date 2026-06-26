import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listZernioAccounts, postToZernio, zernioConfigured, type ZernioAccount } from '@/lib/zernio'

interface MonthlyContentShape {
  tweets?: Array<{ tweets: string[] }>
  articles?: Array<{ title: string; content: string }>
  caseStudies?: Array<{ clientName: string; challenge: string; results: Record<string, string> }>
}

export async function POST(request: NextRequest) {
  try {
    const { contentId } = await request.json()

    if (!contentId) {
      return NextResponse.json({ error: 'contentId required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get monthly content
    const { data: monthlyContent, error: contentError } = await admin
      .from('monthly_content')
      .select('*, monthly_content!inner(client_id)')
      .eq('id', contentId)
      .single()

    if (contentError || !monthlyContent) {
      console.error('Content not found:', contentError)
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (!zernioConfigured()) {
      return NextResponse.json({ error: 'Social posting not configured' }, { status: 503 })
    }

    // Resolve the client's Zernio profile + connected accounts.
    let profileId: string | null = null
    try {
      const { data: client } = await admin
        .from('clients')
        .select('zernio_profile_id')
        .eq('id', monthlyContent.client_id)
        .single()
      profileId = (client?.zernio_profile_id as string | null) ?? null
    } catch {
      profileId = null
    }
    if (!profileId) {
      return NextResponse.json({ error: 'Social accounts not connected' }, { status: 400 })
    }
    const accounts = (await listZernioAccounts(profileId)).filter((a) => a.isActive)

    // Build per-platform target lists once.
    const targetsFor = (platforms: string[]) =>
      accounts
        .filter((a) => platforms.includes(a.platform.toLowerCase()))
        .map((a: ZernioAccount) => ({ platform: a.platform, accountId: a.id }))

    const content = monthlyContent.content as MonthlyContentShape

    // Publish tweets first (smallest batches)
    if (Array.isArray(content.tweets) && content.tweets.length > 0) {
      for (const thread of content.tweets) {
        try {
          // Post each tweet in the thread
          for (let i = 0; i < thread.tweets.length; i++) {
            const tweetText = thread.tweets[i]
            const targets = targetsFor(['twitter'])
            if (targets.length) {
              await postToZernio({ content: tweetText, targets, publishNow: true })
            }
            // Small delay between posts
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } catch (err) {
          console.error('Failed to publish tweet thread:', err)
        }
      }
    }

    // Publish LinkedIn articles
    if (Array.isArray(content.articles) && content.articles.length > 0) {
      for (const article of content.articles) {
        try {
          const snippet = article.content.substring(0, 500) + '...'
          const targets = targetsFor(['linkedin'])
          if (targets.length) {
            await postToZernio({
              content: `${article.title}\n\n${snippet}\n\nRead full article on our blog`,
              targets,
              publishNow: true,
            })
          }
        } catch (err) {
          console.error('Failed to publish article:', err)
        }
      }
    }

    // Publish case studies
    if (Array.isArray(content.caseStudies) && content.caseStudies.length > 0) {
      for (const caseStudy of content.caseStudies) {
        try {
          const post = `Case Study: ${caseStudy.clientName}\n\nChallenge: ${caseStudy.challenge}\n\nResult: ${Object.values(caseStudy.results)[0]}`
          const targets = targetsFor(['linkedin', 'twitter'])
          if (targets.length) {
            await postToZernio({ content: post, targets, publishNow: true })
          }
        } catch (err) {
          console.error('Failed to publish case study:', err)
        }
      }
    }

    // Update status to published
    const { error: updateError } = await admin
      .from('monthly_content')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', contentId)

    if (updateError) {
      console.error('Failed to update publish status:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Content published to all platforms',
    })
  } catch (error) {
    console.error('Failed to publish content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
