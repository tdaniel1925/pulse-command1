import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    // Accepts: { heygen_avatar_id } or { elevenlabs_voice_id } or both
    const { heygen_avatar_id, elevenlabs_voice_id } = body

    if (!heygen_avatar_id && !elevenlabs_voice_id) {
      return NextResponse.json({ error: 'No selection provided' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get client + brand_profile_id
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id, brand_profile_id')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Save to brand_profiles
    if (client.brand_profile_id) {
      const update: Record<string, string> = {}
      if (heygen_avatar_id) update.heygen_avatar_id = heygen_avatar_id
      if (elevenlabs_voice_id) update.elevenlabs_voice_id = elevenlabs_voice_id

      const { error } = await admin
        .from('brand_profiles')
        .update(update)
        .eq('id', client.brand_profile_id)

      if (error) {
        console.error('save-selection brand_profiles error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    // Update onboarding_step if avatar just selected
    if (heygen_avatar_id) {
      await admin.from('clients').update({ onboarding_step: 'avatar_selected' }).eq('id', client.id)
    }
    if (elevenlabs_voice_id) {
      await admin.from('clients').update({ onboarding_step: 'voice_selected' }).eq('id', client.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('save-selection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
