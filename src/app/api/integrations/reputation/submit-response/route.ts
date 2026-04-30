import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient()

    // Get current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await admin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { responseId, finalResponse } = await request.json()

    if (!responseId || !finalResponse) {
      return NextResponse.json(
        { error: 'responseId and finalResponse required' },
        { status: 400 }
      )
    }

    // Get client
    const { data: clientData } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Get response record
    const { data: responseRecord, error: getError } = await admin
      .from('reputation_responses')
      .select('review_id, client_id')
      .eq('id', responseId)
      .eq('client_id', clientData?.id)
      .single()

    if (getError || !responseRecord) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    // Get review details
    const { data: review } = await admin
      .from('reputation_reviews')
      .select('*')
      .eq('id', responseRecord.review_id)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Get integration credentials
    const { data: integration } = await admin
      .from('reputation_integrations')
      .select('*')
      .eq('client_id', clientData?.id)
      .eq('platform', review.platform)
      .single()

    if (!integration) {
      return NextResponse.json(
        { error: `${review.platform} not connected` },
        { status: 400 }
      )
    }

    // Post to appropriate platform
    let postSuccess = false
    const platformName = review.platform.charAt(0).toUpperCase() + review.platform.slice(1)

    try {
      if (review.platform === 'google') {
        const replyRes = await fetch(
          `https://mybusiness.googleapis.com/v4/accounts/me/locations/${integration.google_location_id}/reviews/${review.external_review_id}/reply`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${integration.google_access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              comment: finalResponse,
            }),
          }
        )
        postSuccess = replyRes.ok
      } else if (review.platform === 'yelp') {
        const replyRes = await fetch(
          `https://api.yelp.com/v3/businesses/${integration.yelp_business_id}/reviews/${review.external_review_id}/replies`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${integration.yelp_access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: finalResponse,
            }),
          }
        )
        postSuccess = replyRes.ok
      }
    } catch (error) {
      console.error(`Failed to post to ${review.platform}:`, error)
      return NextResponse.json(
        { error: `Failed to post reply to ${platformName}` },
        { status: 500 }
      )
    }

    if (!postSuccess) {
      return NextResponse.json(
        { error: `Failed to post reply to ${platformName}` },
        { status: 400 }
      )
    }

    // Update response record
    await admin
      .from('reputation_responses')
      .update({
        final_response: finalResponse,
        approved_draft: finalResponse,
        status: 'posted',
        posted_at: new Date().toISOString(),
      })
      .eq('id', responseId)

    // Update review record
    await admin
      .from('reputation_reviews')
      .update({
        replied: true,
        reply_text: finalResponse,
      })
      .eq('id', responseRecord.review_id)

    return NextResponse.json({
      success: true,
      message: `Reply posted to ${platformName}`,
      platform: review.platform,
    })
  } catch (error) {
    console.error('Failed to submit response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
