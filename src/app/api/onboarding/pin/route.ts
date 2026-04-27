import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get currently authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch client by user_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('onboarding_pin')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
    }

    return NextResponse.json({ pin: client.onboarding_pin })
  } catch (error) {
    console.error('GET /api/onboarding/pin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
