import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const admin = createAdminClient()
    const { data: requests } = await admin
      .from('content_requests')
      .select('*, content_request_files(id)')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ requests: requests ?? [] })
  } catch (err) {
    console.error('content-requests GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const body = await request.json()
    const { occasion, description, targetDate, platforms } = body

    if (!occasion) {
      return NextResponse.json({ error: 'Occasion is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: newRequest, error } = await admin
      .from('content_requests')
      .insert({
        client_id: client.id,
        occasion,
        description: description ?? null,
        target_date: targetDate ?? null,
        platforms: platforms ?? [],
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await admin.from('activities').insert({
      client_id: client.id,
      type: 'post',
      title: 'New content request submitted',
      description: `Client submitted a content request: "${occasion}"`,
      created_by: 'client',
    })

    return NextResponse.json({ success: true, requestId: newRequest.id })
  } catch (err) {
    console.error('content-requests POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
