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
      contentPillars, keywords, priorityChannels,
    } = body

    const admin = createAdminClient()

    // Update brand profile with all fields Predis needs + brand context
    if (client.brand_profile_id) {
      await admin.from('brand_profiles').update({
        primary_color: primaryColor ?? null,
        secondary_color: secondaryColor ?? null,
        logo_url: logoUrl ?? null,
        business_description: businessDescription ?? null,
        tagline: tagline ?? null,
        tone_of_voice: toneOfVoice ?? null,
        target_audience: targetAudience ?? null,
        unique_value_prop: uniqueValueProp ?? null,
        content_pillars: contentPillars ?? [],
        keywords: keywords ?? [],
        priority_channels: priorityChannels ?? ['instagram', 'facebook', 'linkedin'],
      }).eq('id', client.brand_profile_id)
    }

    // Update client
    await admin.from('clients').update({
      website: website ?? null,
      industry: industry ?? null,
      onboarding_step: 'brand_assets_saved',
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
