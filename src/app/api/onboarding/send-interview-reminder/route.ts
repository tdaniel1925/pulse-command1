import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'

const getTwilio = () => twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { phone, scheduledFor } = await request.json()
    if (!phone) return NextResponse.json({ error: 'Phone number required' }, { status: 400 })

    const { data: client } = await supabase
      .from('clients')
      .select('first_name, onboarding_pin')
      .eq('user_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const vapiPhone = process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER ?? '+19362373368'
    const pin = client.onboarding_pin
    const name = client.first_name

    // Format the scheduled time for the message
    let timeText = 'soon'
    if (scheduledFor) {
      const date = new Date(scheduledFor)
      timeText = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const message = scheduledFor
      ? `Hi ${name}! ⏰ Reminder: Your PulseCommand brand interview is scheduled for ${timeText}.\n\nCall ${vapiPhone} and enter PIN: ${pin}\n\nTakes ~15 min. This call generates all your content!`
      : `Hi ${name}! Your PulseCommand brand interview is ready.\n\nCall ${vapiPhone} and enter PIN: ${pin}\n\nTakes ~15 min. This unlocks your full content pipeline!`

    await getTwilio().messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
      ...(scheduledFor ? { scheduleType: 'fixed', sendAt: new Date(scheduledFor).toISOString() } : {}),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('send-interview-reminder error:', msg)
    return NextResponse.json({ error: `Failed to send SMS: ${msg}` }, { status: 500 })
  }
}
