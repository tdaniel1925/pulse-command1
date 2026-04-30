import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateStrategyPDF } from '@/lib/pdf-strategy'

/**
 * Export Brand Strategy as HTML (ready for PDF conversion)
 * Client can use html2pdf.js or send to external PDF service
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const admin = createAdminClient()
    const { data: { user }, error: authError } = await admin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client and brand profile with strategy
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id, email, first_name, business_name, brand_profiles(*)')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const bp = Array.isArray(client.brand_profiles) ? client.brand_profiles[0] : client.brand_profiles

    if (!bp?.brand_strategy) {
      return NextResponse.json({ error: 'No strategy found' }, { status: 404 })
    }

    // Generate PDF HTML
    const htmlContent = generateStrategyPDF(
      {
        clientId: client.id,
        businessName: client.business_name,
        ...bp.brand_strategy,
      },
      bp.logo_url || undefined
    )

    // Return as HTML with header to trigger download
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="brand-strategy-${client.business_name || 'plan'}.html"`,
      },
    })
  } catch (error) {
    console.error('Export PDF error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Alternative: POST to generate and convert PDF
 * Could integrate with external service like html2pdf or headless Chrome
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format = 'html' } = body

    // Get current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const admin = createAdminClient()
    const { data: { user }, error: authError } = await admin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client and brand profile with strategy
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id, email, first_name, business_name, brand_profiles(*)')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const bp = Array.isArray(client.brand_profiles) ? client.brand_profiles[0] : client.brand_profiles

    if (!bp?.brand_strategy) {
      return NextResponse.json({ error: 'No strategy found' }, { status: 404 })
    }

    // Generate PDF HTML
    const htmlContent = generateStrategyPDF(
      {
        clientId: client.id,
        businessName: client.business_name,
        ...bp.brand_strategy,
      },
      bp.logo_url || undefined
    )

    if (format === 'html') {
      return NextResponse.json({
        success: true,
        html: htmlContent,
        filename: `brand-strategy-${client.business_name || 'plan'}.html`,
      })
    }

    // For PDF format, would need external service
    // Example: Could use Puppeteer, html2pdf library, or external API
    // For now, return HTML that client-side can convert with html2pdf.js
    return NextResponse.json({
      success: true,
      html: htmlContent,
      format: 'html',
      message: 'Use html2pdf.js library on client-side to convert to PDF',
      filename: `brand-strategy-${client.business_name || 'plan'}.pdf`,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
