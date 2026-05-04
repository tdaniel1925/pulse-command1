import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generate, LIGHT_MODEL } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
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

    const { reviewId } = await request.json()

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId required' },
        { status: 400 }
      )
    }

    // Get client
    const { data: clientData, error: clientError } = await admin
      .from('clients')
      .select('id, business_name')
      .eq('user_id', user.id)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get review
    const { data: review, error: reviewError } = await admin
      .from('reputation_reviews')
      .select('*')
      .eq('id', reviewId)
      .eq('client_id', clientData.id)
      .single()

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Get brand profile for tone/context
    const { data: brandProfile } = await admin
      .from('brand_profiles')
      .select('tone_of_voice, unique_value_prop, brand_personality')
      .eq('client_id', clientData.id)
      .single()

    // Generate AI response
    const draftResponse = await generate({
      model: LIGHT_MODEL,
      maxTokens: 200,
      system: `You are a professional business representative for ${clientData.business_name}.
Your tone is: ${brandProfile?.tone_of_voice || 'professional and friendly'}.
Your brand personality: ${brandProfile?.brand_personality || 'helpful and courteous'}.
Your unique value: ${brandProfile?.unique_value_prop || 'quality service and customer satisfaction'}.

When responding to reviews:
- Acknowledge the reviewer's feedback sincerely
- For negative reviews: apologize for the experience and explain how you'll improve
- For positive reviews: thank them and encourage future business
- Keep responses concise (2-3 sentences max)
- Never be defensive or argue with reviewers
- Include a call to action when appropriate (contact us, visit again, etc.)`,
      prompt: `Draft a professional response to this ${review.platform} review (${review.rating} stars):

"${review.text}"

The response should be genuine, acknowledge their feedback, and maintain our brand voice.`,
    })

    // Store the draft response
    const { data: responseRecord, error: insertError } = await admin
      .from('reputation_responses')
      .insert({
        review_id: reviewId,
        client_id: clientData.id,
        ai_draft: draftResponse,
        status: 'draft',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save draft response:', insertError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      responseId: responseRecord.id,
      draft: draftResponse,
      reviewPlatform: review.platform,
      reviewRating: review.rating,
      reviewAuthor: review.author,
    })
  } catch (error) {
    console.error('Failed to draft response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
