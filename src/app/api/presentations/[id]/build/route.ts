import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Slide {
  index: number;
  layout: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  bullets: string[] | null;
  image_prompt: string | null;
  speaker_notes: string;
  accent_color: string;
  image_url?: string;
}

async function generateSlideImage(imagePrompt: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview-image-generation' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
      generationConfig: {
        // @ts-expect-error — responseModalities is valid for gemini image models
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const candidates = result.response.candidates ?? [];
    for (const candidate of candidates) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          return part.inlineData.data; // base64
        }
      }
    }
    return null;
  } catch (err) {
    console.error('[build] Gemini image generation failed:', err);
    return null;
  }
}

async function uploadImageToStorage(
  admin: ReturnType<typeof createAdminClient>,
  base64Data: string,
  presentationId: string,
  slideIndex: number,
  mimeType = 'image/png'
): Promise<string | null> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = mimeType.split('/')[1] ?? 'png';
    const path = `${presentationId}/slide-${slideIndex}.${ext}`;

    const { error } = await admin.storage
      .from('presentation-images')
      .upload(path, buffer, { contentType: mimeType, upsert: true });

    if (error) {
      console.error('[build] Storage upload failed:', error.message);
      return null;
    }

    const { data } = admin.storage.from('presentation-images').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error('[build] Upload error:', err);
    return null;
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  // Fetch presentation
  const { data: presentation, error: presError } = await admin
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single();

  if (presError || !presentation) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
  }

  // Fetch client
  const { data: client } = await admin
    .from('clients')
    .select('business_name, brand_colors')
    .eq('id', presentation.client_id)
    .single();

  const businessName = client?.business_name ?? 'Our Company';
  const { topic, audience, tone, slide_count: slideCount } = presentation;

  try {
    // Generate slides with Claude
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a world-class presentation designer. Create a ${slideCount}-slide presentation for:

Topic: ${topic}
Audience: ${audience ?? 'General audience'}
Tone: ${tone}
Brand: ${businessName}

Return ONLY valid JSON in this exact structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "index": 0,
      "layout": "title",
      "title": "Main Title",
      "subtitle": "Subtitle or tagline",
      "body": null,
      "bullets": null,
      "image_prompt": "A professional hero image showing...",
      "speaker_notes": "Welcome everyone...",
      "accent_color": "#6366f1"
    },
    {
      "index": 1,
      "layout": "bullets",
      "title": "Section Title",
      "subtitle": null,
      "body": null,
      "bullets": ["Point one", "Point two", "Point three"],
      "image_prompt": null,
      "speaker_notes": "Key points to cover...",
      "accent_color": "#6366f1"
    }
  ]
}

Layout types to use (mix them):
- "title": opening/closing slides, has title + subtitle
- "bullets": title + 3-5 bullet points
- "image_left": image on left, title + bullets on right
- "image_right": title + bullets on left, image on right
- "quote": large pull quote, author attribution
- "stats": title + 3 stat boxes (value + label)
- "two_col": two column layout with title
- "section": section divider with large title and subtitle

Rules:
- First slide must be layout "title"
- Last slide must be layout "title" (closing/CTA)
- Mix layouts naturally
- For stats layout, put stats as bullets: ["$2.4M|Revenue", "98%|Satisfaction", "150+|Clients"]
- image_prompt only for slides with images (image_left, image_right layouts)
- Make content specific, compelling, and professional
- speaker_notes should be 1-3 sentences`,
        },
      ],
    });

    const rawText =
      claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    // Strip markdown code fences
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(jsonText) as { title: string; slides: Slide[] };
    const generatedSlides: Slide[] = [];

    // Process each slide — generate images where needed
    for (const slide of parsed.slides) {
      const processedSlide = { ...slide };

      if (slide.image_prompt) {
        const base64 = await generateSlideImage(slide.image_prompt);
        if (base64) {
          const imageUrl = await uploadImageToStorage(admin, base64, id, slide.index);
          if (imageUrl) {
            processedSlide.image_url = imageUrl;
          }
        }
      }

      generatedSlides.push(processedSlide);
    }

    const thumbnailUrl = generatedSlides.find((s) => s.image_url)?.image_url ?? null;

    // Update presentation to ready
    await admin
      .from('presentations')
      .update({
        status: 'ready',
        slides: generatedSlides,
        title: parsed.title,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[build] Generation failed:', err?.message ?? err);

    await admin
      .from('presentations')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
