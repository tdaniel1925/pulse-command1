import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Fetch Google Reviews for a business
 * Requires Google My Business API credentials
 */
export async function GET(request: NextRequest) {
  try {
    const admin = createAdminClient()

    // Get current user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await admin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get Google connection
    const { data: googleConn, error: connError } = await admin
      .from('reputation_integrations')
      .select('google_location_id, google_access_token')
      .eq('client_id', client.id)
      .eq('platform', 'google')
      .single()

    if (connError || !googleConn?.google_access_token) {
      return NextResponse.json(
        { error: 'Google Business Profile not connected' },
        { status: 400 }
      )
    }

    // Fetch reviews from Google My Business API
    const locationId = googleConn.google_location_id
    const accessToken = googleConn.google_access_token

    const reviewsRes = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/me/locations/${locationId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!reviewsRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Google reviews' },
        { status: reviewsRes.status }
      )
    }

    const { reviews = [] } = await reviewsRes.json()

    // Store reviews in database for caching
    const storedReviews = []
    for (const review of reviews) {
      const { error: insertError } = await admin
        .from('reputation_reviews')
        .upsert(
          {
            client_id: client.id,
            platform: 'google',
            external_review_id: review.name,
            author: review.reviewer?.displayName || 'Anonymous',
            rating: review.reviewReply?.review?.starRating || 0,
            text: review.reviewReply?.review?.comment || '',
            published_at: review.reviewReply?.review?.reviewTime,
            replied: !!review.reviewReply?.reply,
            reply_text: review.reviewReply?.reply?.comment,
          },
          { onConflict: 'external_review_id' }
        )

      if (!insertError) {
        storedReviews.push(review)
      }
    }

    return NextResponse.json({
      platform: 'google',
      reviewCount: reviews.length,
      reviews: storedReviews.slice(0, 10), // Return latest 10
    })
  } catch (error) {
    console.error('Failed to fetch Google reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Post a reply to a Google review
 */
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

    const { reviewId, replyText } = await request.json()

    if (!reviewId || !replyText) {
      return NextResponse.json(
        { error: 'reviewId and replyText required' },
        { status: 400 }
      )
    }

    // Get client
    const { data: client } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Get Google connection
    const { data: googleConn } = await admin
      .from('reputation_integrations')
      .select('google_location_id, google_access_token')
      .eq('client_id', client?.id)
      .eq('platform', 'google')
      .single()

    if (!googleConn?.google_access_token) {
      return NextResponse.json({ error: 'Google not connected' }, { status: 400 })
    }

    // Post reply to Google
    const locationId = googleConn.google_location_id
    const accessToken = googleConn.google_access_token

    const replyRes = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/me/locations/${locationId}/reviews/${reviewId}/reply`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: replyText,
        }),
      }
    )

    if (!replyRes.ok) {
      return NextResponse.json(
        { error: 'Failed to post reply to Google' },
        { status: replyRes.status }
      )
    }

    // Mark as replied in database
    await admin
      .from('reputation_reviews')
      .update({
        replied: true,
        reply_text: replyText,
      })
      .eq('external_review_id', reviewId)

    return NextResponse.json({ success: true, message: 'Reply posted to Google' })
  } catch (error) {
    console.error('Failed to post Google review reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
