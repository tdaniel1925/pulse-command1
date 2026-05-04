export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generate, DEFAULT_MODEL } from '@/lib/openrouter';
import { createAdminClient } from '@/lib/supabase/admin';

async function generateWithAI(prompt: string): Promise<string> {
  return generate({
    system: 'You are an expert content marketer. Generate high-quality, engaging content exactly as requested. Return only the content itself with no preamble.',
    prompt,
    model: DEFAULT_MODEL,
    maxTokens: 4096,
  });
}

async function generateElevenLabsAudio(script: string, voiceId: string): Promise<Buffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!response.ok) throw new Error(`ElevenLabs error: ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function submitHeyGenVideo(script: string, avatarId: string): Promise<string> {
  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
          voice: { type: 'text', input_text: script },
          background: { type: 'color', value: '#ffffff' },
        },
      ],
      dimension: { width: 1080, height: 1920 },
      aspect_ratio: '9:16',
    }),
  });
  if (!response.ok) throw new Error(`HeyGen error: ${response.statusText}`);
  const json = await response.json() as { data?: { video_id?: string } };
  return json.data?.video_id ?? '';
}

export async function POST(req: NextRequest) {
  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch client + brand profile
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('client_id', clientId)
    .single();

  // Fetch active add-ons
  const { data: clientAddons } = await supabase
    .from('client_addons')
    .select('addon_key')
    .eq('client_id', clientId)
    .eq('status', 'active');

  const activeAddons = new Set((clientAddons ?? []).map((a: { addon_key: string }) => a.addon_key));

  const plan: string = client.plan ?? 'full';
  const socialPostCount = plan === 'lite' ? 30 : 150;
  const videoCount = plan === 'lite' ? 1 : 4;

  const businessName: string = client.business_name ?? 'the business';
  const industry: string = client.industry ?? 'general';
  const description: string = brandProfile?.business_description ?? '';
  const audience: string = brandProfile?.target_audience ?? '';
  const tone: string = brandProfile?.tone_of_voice ?? 'professional and friendly';
  const pillars: string[] = brandProfile?.content_pillars ?? [];
  const avatarId: string = brandProfile?.heygen_avatar_id ?? '';
  const voiceId: string = brandProfile?.elevenlabs_voice_id ?? '';

  const contentItems: Array<{
    client_id: string;
    type: string;
    content: string | null;
    url: string | null;
    metadata: Record<string, unknown>;
  }> = [];

  // --- Social Posts (batches of 10) ---
  const batchCount = Math.ceil(socialPostCount / 10);
  const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X', 'TikTok'];

  for (let batch = 0; batch < batchCount; batch++) {
    const batchSize = Math.min(10, socialPostCount - batch * 10);
    const platform = platforms[batch % platforms.length];
    const postsText = await generateWithAI(
      `Create ${batchSize} unique social media posts for ${businessName}, a ${industry} business.
Business description: ${description}
Target audience: ${audience}
Tone: ${tone}
Content pillars: ${pillars.join(', ')}
Platform: ${platform}

Format each post as:
POST [number]:
[post content with relevant hashtags]
---`
    );

    // Split by "POST" separator and save each
    const postChunks = postsText.split(/POST \d+:/).filter((p) => p.trim().length > 20);
    for (const chunk of postChunks) {
      contentItems.push({
        client_id: clientId,
        type: 'social_post',
        content: chunk.replace(/^---+/gm, '').trim(),
        url: null,
        metadata: { platform, batch: batch + 1 },
      });
    }
  }

  // --- Podcast Script + Audio ---
  const podcastScript = await generateWithAI(
    `Write a 5-minute podcast script for ${businessName}, a ${industry} business.
Description: ${description}
Target audience: ${audience}
Tone: ${tone}
Include: intro, 3 main points with examples, a CTA at the end.
Write it as natural spoken word.`
  );

  let podcastUrl: string | null = null;
  if (voiceId) {
    try {
      const audioBuffer = await generateElevenLabsAudio(podcastScript, voiceId);
      const filePath = `podcasts/${clientId}/${Date.now()}.mp3`;
      const { data: uploadData } = await supabase.storage
        .from('content')
        .upload(filePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true });
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('content').getPublicUrl(filePath);
        podcastUrl = urlData.publicUrl;
      }
    } catch (err) {
      console.error('[deliver-client] ElevenLabs error:', err);
    }
  }

  contentItems.push({
    client_id: clientId,
    type: 'podcast',
    content: podcastScript,
    url: podcastUrl,
    metadata: { voice_id: voiceId },
  });

  // --- Short Videos ---
  for (let v = 0; v < videoCount; v++) {
    const videoScript = await generateWithAI(
      `Write a 30-45 second vertical video script for ${businessName}, a ${industry} business.
Description: ${description}
Tone: ${tone}
Video ${v + 1} of ${videoCount} — make it engaging with a strong hook in the first 3 seconds.
Include visual cues in [brackets]. End with a clear CTA.`
    );

    let heygenVideoId: string | null = null;
    if (avatarId) {
      try {
        heygenVideoId = await submitHeyGenVideo(videoScript, avatarId);
      } catch (err) {
        console.error('[deliver-client] HeyGen error:', err);
      }
    }

    contentItems.push({
      client_id: clientId,
      type: 'short_video',
      content: videoScript,
      url: null,
      metadata: { heygen_video_id: heygenVideoId, video_index: v + 1, avatar_id: avatarId },
    });
  }

  // --- Newsletter (if add-on active) ---
  if (activeAddons.has('newsletter')) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    fetch(`${baseUrl}/api/pipeline/send-newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    }).catch((err) => console.error('[deliver-client] Newsletter error:', err));
  }

  // --- Lead Magnet (if add-on active and not yet delivered) ---
  if (activeAddons.has('lead_magnet')) {
    const { data: existingLM } = await supabase
      .from('content_items')
      .select('id')
      .eq('client_id', clientId)
      .eq('type', 'lead_magnet')
      .maybeSingle();

    if (!existingLM) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      fetch(`${baseUrl}/api/pipeline/generate-lead-magnet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      }).catch((err) => console.error('[deliver-client] Lead magnet error:', err));
    }
  }

  // --- Save all content items ---
  if (contentItems.length > 0) {
    const { error: insertError } = await supabase.from('content_items').insert(contentItems);
    if (insertError) {
      console.error('[deliver-client] Insert error:', insertError);
    }
  }

  // --- Update client delivery timestamps ---
  const now = new Date();
  const nextDelivery = new Date(now);
  nextDelivery.setDate(nextDelivery.getDate() + 30);

  await supabase
    .from('clients')
    .update({
      last_delivered_at: now.toISOString(),
      next_delivery_at: nextDelivery.toISOString(),
    })
    .eq('id', clientId);

  // --- Notify client via email ---
  if (client.email) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BundledContent <noreply@bundledcontent.com>',
        to: client.email,
        subject: 'Your monthly content is ready! 🎉',
        html: `<h2>Hi ${client.first_name ?? 'there'},</h2>
<p>Your monthly content batch for <strong>${businessName}</strong> is ready in your dashboard.</p>
<p>This month we created:</p>
<ul>
  <li>${socialPostCount} social media posts</li>
  <li>1 podcast episode</li>
  <li>${videoCount} short video${videoCount > 1 ? 's' : ''}</li>
  ${activeAddons.has('newsletter') ? '<li>Your email newsletter has been sent</li>' : ''}
</ul>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View your content →</a></p>
<p>— The BundledContent Team</p>`,
      }),
    }).catch((err) => console.error('[deliver-client] Email error:', err));
  }

  // --- Notify client via SMS ---
  if (client.phone) {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_PHONE_NUMBER!,
        To: client.phone,
        Body: `Hi ${client.first_name ?? 'there'}! Your monthly content for ${businessName} is ready. Log in to view: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }),
    }).catch((err) => console.error('[deliver-client] SMS error:', err));
  }

  return NextResponse.json({
    success: true,
    clientId,
    contentCreated: contentItems.length,
    socialPosts: socialPostCount,
    videos: videoCount,
  });
}
