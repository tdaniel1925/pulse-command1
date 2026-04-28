import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface VapiCall {
  id: string
  transcript?: string
  duration?: number
  phoneNumber?: string
}

interface VapiWebhookPayload {
  type: string
  call: VapiCall
}

export async function POST(request: NextRequest) {
  try {
    const payload: VapiWebhookPayload = await request.json()
    const { type, call } = payload

    if (type !== 'call-ended') {
      console.log('Ignoring VAPI event type:', type)
      return NextResponse.json({ success: true })
    }

    const { id: callId, transcript, duration, phoneNumber } = call
    console.log('VAPI call-ended received:', callId, 'phone:', phoneNumber)

    // Extract 6-digit PIN from transcript
    const pinMatch = transcript?.match(/\b\d{6}\b/)
    const pin = pinMatch?.[0]

    if (!pin) {
      console.log('No PIN found in transcript for call:', callId)
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()

    // Look up client by onboarding PIN
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, brand_profile_id')
      .eq('onboarding_pin', pin)
      .single()

    if (clientError || !client) {
      console.log('No client found for PIN:', pin)
      return NextResponse.json({ success: true })
    }

    console.log('Matched VAPI call to client:', client.id)

    // Update client record
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        vapi_call_id: callId,
        call_completed_at: new Date().toISOString(),
        onboarding_step: 'call_done',
      })
      .eq('id', client.id)

    if (updateError) console.error('Error updating client after VAPI call:', updateError)

    // Log activity
    await supabase.from('activities').insert({
      client_id: client.id,
      type: 'call',
      title: 'VAPI onboarding interview completed',
      description: `Call duration: ${duration ?? 0}s`,
    })

    // Save transcript to brand_profiles if one exists
    if (client.brand_profile_id && transcript) {
      const { error: transcriptError } = await supabase
        .from('brand_profiles')
        .update({ vapi_transcript: transcript })
        .eq('id', client.brand_profile_id)

      if (transcriptError) console.error('Error saving transcript:', transcriptError)
    }

    // Trigger Claude Opus transcript analysis + auto content generation
    if (transcript) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      fetch(`${baseUrl}/api/pipeline/analyze-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, transcript }),
      }).catch(err => console.error('analyze-transcript trigger failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('VAPI webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
