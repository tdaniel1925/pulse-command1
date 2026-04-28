import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id, brand_profile_id')
      .eq('user_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const body = await request.json()
    const {
      primaryColor, secondaryColor, logoUrl,
      businessDescription, tagline, industry, website,
      toneOfVoice, targetAudience, uniqueValueProp,
      contentPillars, keywords,
    } = body

    const admin = createAdminClient()

    // Update brand profile with all fields
    if (client.brand_profile_id) {
      await admin.from('brand_profiles').update({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        business_description: businessDescription,
        tone_of_voice: toneOfVoice,
        target_audience: targetAudience,
        unique_value_prop: uniqueValueProp,
        content_pillars: contentPillars ?? [],
        keywords: keywords ?? [],
      }).eq('id', client.brand_profile_id)
    }

    // Update client
    await admin.from('clients').update({
      website,
      industry,
      onboarding_step: 'assets_recorded',
    }).eq('id', client.id)

    await admin.from('activities').insert({
      client_id: client.id,
      type: 'onboarding_step',
      title: 'Brand assets collected',
      description: 'Logo, colors, brand voice, and AI-extracted brand data saved.',
      created_by: 'system',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('save-brand-assets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
