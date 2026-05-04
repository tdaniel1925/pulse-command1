export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, DEFAULT_MODEL } from '@/lib/openrouter';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Check newsletter add-on is active
  const { data: addon } = await supabase
    .from('client_addons')
    .select('id')
    .eq('client_id', clientId)
    .eq('addon_key', 'newsletter')
    .eq('status', 'active')
    .maybeSingle();

  if (!addon) {
    return NextResponse.json({ error: 'Newsletter add-on not active' }, { status: 403 });
  }

  const newsletterList: string[] = client.newsletter_list ?? [];
  if (newsletterList.length === 0) {
    return NextResponse.json({ error: 'No subscribers in newsletter list', sent: 0 });
  }

  // Fetch brand profile
  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('client_id', clientId)
    .single();

  const businessName: string = client.business_name ?? 'our business';
  const industry: string = client.industry ?? 'general';
  const description: string = brandProfile?.business_description ?? '';
  const audience: string = brandProfile?.target_audience ?? '';
  const tone: string = brandProfile?.tone_of_voice ?? 'professional and friendly';
  const website: string = client.website ?? '#';
  const primaryColor: string = brandProfile?.primary_color ?? '#4F46E5';

  const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Generate newsletter content with AI
  let newsletter: {
    subject: string;
    preheader: string;
    tip: { heading: string; body: string };
    insight: { heading: string; body: string };
    featured_service: { heading: string; body: string; cta_text: string; cta_url: string };
    closing: string;
  };

  try {
    newsletter = await generateJSON({
      system: 'You are an expert email copywriter. Generate newsletter content in valid JSON format only.',
      model: DEFAULT_MODEL,
      maxTokens: 3000,
      prompt: `Create a monthly email newsletter for ${businessName}, a ${industry} business.
Business: ${description}
Audience: ${audience}
Tone: ${tone}
Month: ${month}

Return valid JSON with this exact structure:
{
  "subject": "compelling subject line",
  "preheader": "preview text under 100 chars",
  "tip": { "heading": "...", "body": "..." },
  "insight": { "heading": "...", "body": "..." },
  "featured_service": { "heading": "...", "body": "...", "cta_text": "...", "cta_url": "${website}" },
  "closing": "warm closing paragraph"
}`,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to parse newsletter content' }, { status: 500 });
  }

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${newsletter.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:${primaryColor};padding:32px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;text-transform:uppercase;letter-spacing:1px;">${month}</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">${businessName}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 48px;">
            <!-- Tip -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="border-left:4px solid ${primaryColor};padding-left:16px;">
                  <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">${newsletter.tip.heading}</h2>
                  <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">${newsletter.tip.body}</p>
                </td>
              </tr>
            </table>
            <!-- Insight -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background:#f9fafb;border-radius:8px;padding:24px;">
              <tr>
                <td>
                  <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">${newsletter.insight.heading}</h2>
                  <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">${newsletter.insight.body}</p>
                </td>
              </tr>
            </table>
            <!-- Featured Service -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td>
                  <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">${newsletter.featured_service.heading}</h2>
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">${newsletter.featured_service.body}</p>
                  <a href="${newsletter.featured_service.cta_url}" style="display:inline-block;background:${primaryColor};color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${newsletter.featured_service.cta_text}</a>
                </td>
              </tr>
            </table>
            <!-- Closing -->
            <p style="color:#374151;font-size:15px;line-height:1.6;">${newsletter.closing}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:24px 48px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
            <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">Powered by <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#9ca3af;">BundledContent</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Send to all subscribers via Resend
  let sentCount = 0;
  for (const email of newsletterList) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${businessName} <newsletter@bundledcontent.com>`,
          to: email,
          subject: newsletter.subject,
          html: htmlBody,
          headers: { 'X-Entity-Ref-ID': `newsletter-${clientId}-${Date.now()}` },
        }),
      });
      if (res.ok) sentCount++;
    } catch (err) {
      console.error(`[send-newsletter] Failed to send to ${email}:`, err);
    }
  }

  // Save as content item
  await supabase.from('content_items').insert({
    client_id: clientId,
    type: 'newsletter',
    content: htmlBody,
    url: null,
    metadata: { subject: newsletter.subject, recipients: newsletterList.length, sent: sentCount, month },
  });

  return NextResponse.json({ sent: sentCount, total: newsletterList.length });
}
