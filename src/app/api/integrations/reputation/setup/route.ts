import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Setup reputation integration (Google or Yelp)
 * Stores connection credentials for fetching reviews
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

    const {
      platform,
      googleLocationId,
      googleAccessToken,
      yelpBusinessId,
      yelpAccessToken,
    } = await request.json()

    if (!platform || !['google', 'yelp'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
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

    // Validate credentials based on platform
    if (platform === 'google') {
      if (!googleLocationId || !googleAccessToken) {
        return NextResponse.json(
          { error: 'Google location ID and access token required' },
          { status: 400 }
        )
      }
    } else if (platform === 'yelp') {
      if (!yelpBusinessId || !yelpAccessToken) {
        return NextResponse.json(
          { error: 'Yelp business ID and access token required' },
          { status: 400 }
        )
      }
    }

    // Upsert integration record
    const { error: upsertError } = await admin
      .from('reputation_integrations')
      .upsert(
        {
          client_id: client.id,
          platform,
          google_location_id: googleLocationId || null,
          google_access_token: googleAccessToken || null,
          yelp_business_id: yelpBusinessId || null,
          yelp_access_token: yelpAccessToken || null,
          connected: true,
          last_sync_at: new Date().toISOString(),
        },
        { onConflict: 'client_id,platform' }
      )

    if (upsertError) {
      console.error('Failed to setup integration:', upsertError)
      return NextResponse.json(
        { error: 'Failed to setup integration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} integration connected`,
    })
  } catch (error) {
    console.error('Failed to setup integration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Get reputation integration status for a platform
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json(
        { error: 'platform query param required' },
        { status: 400 }
      )
    }

    // Get client
    const { data: client } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get integration
    const { data: integration } = await admin
      .from('reputation_integrations')
      .select('connected, last_sync_at, platform')
      .eq('client_id', client.id)
      .eq('platform', platform)
      .single()

    return NextResponse.json({
      platform,
      connected: integration?.connected || false,
      lastSync: integration?.last_sync_at || null,
    })
  } catch (error) {
    console.error('Failed to get integration status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
