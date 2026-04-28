import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email, phone, business_name, onboarding_pin, onboarding_step, status, subscription_status, brand_profiles(heygen_avatar_id, elevenlabs_voice_id)')
      .eq('user_id', user.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const bp = Array.isArray(client.brand_profiles) ? client.brand_profiles[0] : client.brand_profiles
    return NextResponse.json({
      ...client,
      heygen_avatar_id: bp?.heygen_avatar_id ?? null,
      elevenlabs_voice_id: bp?.elevenlabs_voice_id ?? null,
      brand_profiles: undefined,
    })
  } catch (error) {
    console.error('GET /api/auth/me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
