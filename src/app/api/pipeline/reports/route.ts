import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendReportEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email, business_name')
      .eq('subscription_status', 'active')

    if (clientsError) {
      console.error('Error fetching active clients:', clientsError)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({ success: true, clientsProcessed: 0 })
    }

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    for (const client of clients) {
      console.log('Generating monthly report for client:', client.id)

      // Gather placeholder stats
      const stats = {
        postsPublished: Math.floor(Math.random() * 50) + 100,
        videoViews: Math.floor(Math.random() * 5000) + 1000,
        audioListens: Math.floor(Math.random() * 2000) + 500,
        leadsGenerated: Math.floor(Math.random() * 30) + 5,
        conversionRate: (Math.random() * 5 + 1).toFixed(2) + '%',
      }

      // Insert report record with generating status
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          client_id: client.id,
          month,
          year,
          status: 'generating',
          data: stats,
        })
        .select('id')
        .single()

      if (reportError) {
        console.error('Error inserting report for client:', client.id, reportError)
        continue
      }

      // TODO: generate PDF via external service (e.g. PDFShift, Puppeteer)
      // const pdf = await pdfService.generate({ template: 'monthly-report', data: stats, client })
      console.log('TODO: Generate PDF report for client:', client.id)

      // Update report status to ready
      await supabase
        .from('reports')
        .update({ status: 'ready' })
        .eq('id', report.id)

      // Send report email
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
      const { data: clientRecord } = await supabase
        .from('clients')
        .select('email, first_name')
        .eq('id', client.id)
        .single()

      if (clientRecord) {
        await sendReportEmail({
          to: clientRecord.email,
          firstName: clientRecord.first_name,
          month: monthNames[new Date().getMonth()],
          year: new Date().getFullYear(),
        }).catch(err => console.error('Report email failed:', err))
      }

      // Log activity
      await supabase.from('activities').insert({
        client_id: client.id,
        type: 'report',
        title: 'Monthly report generated',
        description: `Report for ${month}/${year} is ready`,
      })
    }

    return NextResponse.json({ success: true, clientsProcessed: clients.length })
  } catch (error) {
    console.error('Reports pipeline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
