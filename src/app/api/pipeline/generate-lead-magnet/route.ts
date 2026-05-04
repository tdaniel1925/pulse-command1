export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, DEFAULT_MODEL } from '@/lib/openrouter';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { LeadMagnetDocument } from '@/components/pdf/LeadMagnetDocument';

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

  // Check lead_magnet add-on is active
  const { data: addon } = await supabase
    .from('client_addons')
    .select('id')
    .eq('client_id', clientId)
    .eq('addon_key', 'lead_magnet')
    .eq('status', 'active')
    .maybeSingle();

  if (!addon) {
    return NextResponse.json({ error: 'Lead magnet add-on not active' }, { status: 403 });
  }

  // Fetch brand profile
  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('client_id', clientId)
    .single();

  const businessName: string = client.business_name ?? 'Our Business';
  const industry: string = client.industry ?? 'general';
  const description: string = brandProfile?.business_description ?? '';
  const audience: string = brandProfile?.target_audience ?? '';
  const website: string = client.website ?? '';
  const primaryColor: string = brandProfile?.primary_color ?? '#4F46E5';

  // Generate lead magnet content with AI
  let content: {
    title: string;
    subtitle: string;
    intro: string;
    sections: Array<{ heading: string; body: string; tips: string[] }>;
    cta_heading: string;
    cta_body: string;
    cta_action: string;
  };

  try {
    content = await generateJSON({
      system: 'You are an expert copywriter specializing in lead magnets. Generate content in valid JSON format only.',
      model: DEFAULT_MODEL,
      maxTokens: 4000,
      prompt: `Create a high-value lead magnet PDF guide for ${businessName}, a ${industry} business.
Business: ${description}
Ideal customer: ${audience}

Requirements:
- Practical guide or checklist format
- 5-7 sections
- Tailored to ${industry} audience
- Ends with CTA to contact ${businessName}

Return valid JSON with this exact structure:
{
  "title": "guide title",
  "subtitle": "subtitle under 80 chars",
  "intro": "2-3 sentence intro paragraph",
  "sections": [
    { "heading": "section title", "body": "2-3 paragraph body text", "tips": ["tip 1", "tip 2", "tip 3"] }
  ],
  "cta_heading": "closing CTA heading",
  "cta_body": "closing paragraph with offer to help",
  "cta_action": "Contact ${businessName} today"
}`,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to parse lead magnet content' }, { status: 500 });
  }

  // Render PDF
  const pdfBuffer = await renderToBuffer(
    createElement(LeadMagnetDocument, {
      businessName,
      website,
      primaryColor,
      content,
    })
  );

  // Upload to Supabase Storage
  const filePath = `pdfs/${clientId}/lead-magnet.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('content')
    .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('content').getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;

  // Save as content item
  await supabase.from('content_items').insert({
    client_id: clientId,
    type: 'lead_magnet',
    content: content.title,
    url: publicUrl,
    metadata: { title: content.title, subtitle: content.subtitle, sections: content.sections.length },
  });

  return NextResponse.json({ url: publicUrl });
}
