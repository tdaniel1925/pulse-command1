import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// Requires: npm install twilio
import twilio from 'twilio'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: 'Missing required field: message' }, { status: 400 })
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return NextResponse.json({ success: false, error: 'Twilio not configured' }, { status: 503 })
    }

    const supabase = await createClient()

    // Get client phone number
    const { data: clientRecord, error: clientError } = await supabase
      .from('clients')
      .select('phone, first_name, last_name')
      .eq('id', id)
      .single()

    if (clientError || !clientRecord) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!clientRecord?.phone) {
      return NextResponse.json({ error: 'Client has no phone number' }, { status: 400 })
    }

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    await twilioClient.messages.create({
      to: clientRecord.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    })

    // Log activity
    await supabase.from('activities').insert({
      client_id: id,
      type: 'sms',
      title: 'SMS sent',
      description: message,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/clients/[id]/sms error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
