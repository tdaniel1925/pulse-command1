import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // VAPI sends different event types — handle both formats
    // Type can be: 'end-of-call-report', 'call-ended', 'status-update'
    const type = payload.type ?? payload.message?.type
    console.log('VAPI webhook received type:', type)

    // Only process end-of-call events
    if (type !== 'end-of-call-report' && type !== 'call-ended') {
      return NextResponse.json({ success: true })
    }

    // VAPI end-of-call-report payload structure:
    // { type, call: { id, ... }, transcript, summary, recordingUrl, durationSeconds }
    // OR nested under message for some versions
    const data = payload.message ?? payload
    const call = data.call ?? {}
    const callId = call.id ?? payload.callId
    const transcript = data.transcript ?? call.transcript ?? ''
    const summary = data.summary ?? ''
    const duration = data.durationSeconds ?? call.duration ?? 0
    const recordingUrl = data.recordingUrl ?? call.recordingUrl ?? null

    console.log('VAPI call ended:', callId, 'duration:', duration, 'transcript length:', transcript?.length)

    if (!transcript) {
      console.log('No transcript in VAPI payload for call:', callId)
      return NextResponse.json({ success: true })
    }

    // Extract 6-digit PIN from transcript
    const pinMatch = transcript.match(/\b(\d{6})\b/)
    const pin = pinMatch?.[1]

    if (!pin) {
      console.log('No 6-digit PIN found in transcript for call:', callId)
      console.log('Transcript preview:', transcript.slice(0, 500))
      return NextResponse.json({ success: true })
    }

    console.log('Found PIN in transcript:', pin)

    const admin = createAdminClient()

    // Look up client by onboarding PIN
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id, brand_profile_id')
      .eq('onboarding_pin', pin)
      .single()

    if (clientError || !client) {
      console.log('No client found for PIN:', pin, clientError?.message)
      return NextResponse.json({ success: true })
    }

    console.log('Matched VAPI call to client:', client.id)

    // Update client record
    await admin.from('clients').update({
      vapi_call_id: callId,
      call_completed_at: new Date().toISOString(),
      onboarding_step: 'call_done',
    }).eq('id', client.id)

    // Save transcript + summary to brand_profiles
    if (client.brand_profile_id) {
      await admin.from('brand_profiles').update({
        vapi_transcript: transcript,
        ai_analysis_raw: summary || null,
      }).eq('id', client.brand_profile_id)
    }

    // Log activity
    await admin.from('activities').insert({
      client_id: client.id,
      type: 'call',
      title: 'Brand interview completed',
      description: `Call duration: ${Math.round(duration / 60)}min. Transcript: ${transcript.length} chars. Content generation starting.`,
      created_by: 'system',
    })

    // Trigger Claude Opus transcript analysis + auto content generation (fire and forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pulse-command1.vercel.app'
    fetch(`${baseUrl}/api/pipeline/analyze-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id, transcript }),
    }).catch(err => console.error('analyze-transcript trigger failed:', err))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('VAPI webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
