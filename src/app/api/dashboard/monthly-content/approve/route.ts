import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

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

    const { contentId } = await request.json()

    if (!contentId) {
      return NextResponse.json({ error: 'contentId required' }, { status: 400 })
    }

    // Get client ID from user
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Verify content belongs to client
    const { data: content, error: contentCheckError } = await admin
      .from('monthly_content')
      .select('*')
      .eq('id', contentId)
      .eq('client_id', client.id)
      .single()

    if (contentCheckError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Update status to approved
    const { error: updateError } = await admin
      .from('monthly_content')
      .update({ status: 'approved' })
      .eq('id', contentId)

    if (updateError) {
      console.error('Failed to approve content:', updateError)
      return NextResponse.json({ error: 'Failed to approve content' }, { status: 500 })
    }

    // Create notification
    await createNotification({
      clientId: client.id,
      type: 'monthly_content_ready',
      title: 'Content Approved',
      body: 'Your monthly content has been approved and is now publishing to all channels.',
      link: '/dashboard/monthly-content',
    })

    // Trigger publishing via fire-and-forget
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/dashboard/monthly-content/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId }),
    }).catch(err => console.error('Failed to trigger publishing:', err))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to approve content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
