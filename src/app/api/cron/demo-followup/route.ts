import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendDemoNotification } from '@/app/api/demo/generate/route'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Verify this is a legitimate Vercel Cron request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = Date.now()

  // Fetch all done, not-yet-signed-up demos from the past 48h
  const since = new Date(now - 48 * 60 * 60 * 1000).toISOString()
  const { data: demos, error } = await admin
    .from('demo_requests')
    .select('id, name, email, phone, created_at, notified_1h, notified_24h, notified_47h')
    .eq('status', 'done')
    .eq('signed_up', false)
    .gte('created_at', since)

  if (error) {
    console.error('demo-followup cron: fetch error', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!demos || demos.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  const results: string[] = []

  for (const demo of demos) {
    const ageMs = now - new Date(demo.created_at).getTime()
    const ageH = ageMs / (1000 * 60 * 60)

    try {
      // 1-hour follow-up: fire between 1h and 2h after creation
      if (!demo.notified_1h && ageH >= 1 && ageH < 2) {
        await sendDemoNotification(demo.name, demo.email, demo.phone, demo.id, 'followup_1h')
        await admin.from('demo_requests').update({ notified_1h: true }).eq('id', demo.id)
        results.push(`1h: ${demo.id}`)
        sent++
      }
      // 24-hour follow-up: fire between 24h and 25h after creation
      else if (!demo.notified_24h && ageH >= 24 && ageH < 25) {
        await sendDemoNotification(demo.name, demo.email, demo.phone, demo.id, 'followup_24h')
        await admin.from('demo_requests').update({ notified_24h: true }).eq('id', demo.id)
        results.push(`24h: ${demo.id}`)
        sent++
      }
      // 47-hour follow-up: fire between 47h and 48h after creation
      else if (!demo.notified_47h && ageH >= 47 && ageH < 48) {
        await sendDemoNotification(demo.name, demo.email, demo.phone, demo.id, 'followup_47h')
        await admin.from('demo_requests').update({ notified_47h: true }).eq('id', demo.id)
        results.push(`47h: ${demo.id}`)
        sent++
      }
    } catch (err) {
      console.error(`demo-followup: failed for ${demo.id}`, err)
    }
  }

  return NextResponse.json({ sent, results })
}
