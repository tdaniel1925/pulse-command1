import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Fetch Yelp Reviews for a business
 * Requires Yelp Fusion API credentials
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

    // Get Yelp connection
    const { data: yelpConn, error: connError } = await admin
      .from('reputation_integrations')
      .select('yelp_business_id, yelp_access_token')
      .eq('client_id', client.id)
      .eq('platform', 'yelp')
      .single()

    if (connError || !yelpConn?.yelp_access_token) {
      return NextResponse.json(
        { error: 'Yelp Business not connected' },
        { status: 400 }
      )
    }

    // Fetch reviews from Yelp Fusion API
    const businessId = yelpConn.yelp_business_id
    const accessToken = yelpConn.yelp_access_token

    const reviewsRes = await fetch(
      `https://api.yelp.com/v3/businesses/${businessId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!reviewsRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Yelp reviews' },
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
            platform: 'yelp',
            external_review_id: review.id,
            author: review.user?.name || 'Anonymous',
            rating: review.rating,
            text: review.text,
            published_at: review.time_created,
            replied: !!review.business?.response,
            reply_text: review.business?.response?.text,
          },
          { onConflict: 'external_review_id' }
        )

      if (!insertError) {
        storedReviews.push(review)
      }
    }

    return NextResponse.json({
      platform: 'yelp',
      reviewCount: reviews.length,
      reviews: storedReviews.slice(0, 10), // Return latest 10
    })
  } catch (error) {
    console.error('Failed to fetch Yelp reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Post a reply to a Yelp review
 * Note: Yelp API only allows business owners to reply to reviews
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

    // Get Yelp connection
    const { data: yelpConn } = await admin
      .from('reputation_integrations')
      .select('yelp_business_id, yelp_access_token')
      .eq('client_id', client?.id)
      .eq('platform', 'yelp')
      .single()

    if (!yelpConn?.yelp_access_token) {
      return NextResponse.json({ error: 'Yelp not connected' }, { status: 400 })
    }

    // Post reply to Yelp
    const businessId = yelpConn.yelp_business_id
    const accessToken = yelpConn.yelp_access_token

    const replyRes = await fetch(
      `https://api.yelp.com/v3/businesses/${businessId}/reviews/${reviewId}/replies`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: replyText,
        }),
      }
    )

    if (!replyRes.ok) {
      return NextResponse.json(
        { error: 'Failed to post reply to Yelp' },
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

    return NextResponse.json({ success: true, message: 'Reply posted to Yelp' })
  } catch (error) {
    console.error('Failed to post Yelp review reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
