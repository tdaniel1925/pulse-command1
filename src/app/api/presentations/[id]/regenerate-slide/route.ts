import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateJSON, DEFAULT_MODEL } from '@/lib/openrouter';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Slide {
  index: number;
  layout: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  bullets: string[] | null;
  image_prompt: string | null;
  image_url?: string | null;
  speaker_notes: string | null;
  accent_color: string;
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
        if (part.inlineData?.data) return part.inlineData.data;
      }
    }
    return null;
  } catch (err) {
    console.error('[regenerate-slide] Gemini image generation failed:', err);
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
      console.error('[regenerate-slide] Storage upload failed:', error.message);
      return null;
    }
    const { data } = admin.storage.from('presentation-images').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error('[regenerate-slide] Upload error:', err);
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as { slideIndex: number };
  const { slideIndex } = body;

  if (typeof slideIndex !== 'number') {
    return NextResponse.json({ error: 'slideIndex is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: presentation, error: presError } = await admin
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single();

  if (presError || !presentation) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
  }

  const slides = presentation.slides as Slide[];
  const slide = slides[slideIndex];

  if (!slide) {
    return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
  }

  const prompt = `You are a world-class presentation designer.

Regenerate slide ${slideIndex + 1} of this presentation.

Presentation topic: ${presentation.topic}
Audience: ${presentation.audience ?? 'General audience'}
Tone: ${presentation.tone}

Current slide (needs improvement):
Layout: ${slide.layout}
Title: ${slide.title}
Content: ${JSON.stringify(slide.bullets ?? slide.subtitle ?? slide.body)}

Create an improved version. Keep the same layout type but make the content:
- More specific and compelling
- Better structured
- Stronger title (complete sentence/claim)
- Tighter bullets (max 12 words each)

Return ONLY valid JSON for a single slide object (same structure as before):
{
  "index": ${slideIndex},
  "layout": "${slide.layout}",
  "title": "improved title",
  "subtitle": null,
  "body": null,
  "bullets": ["bullet 1", "bullet 2"] or null,
  "image_prompt": "vivid scene description" or null,
  "speaker_notes": "what to say",
  "accent_color": "${slide.accent_color}"
}`;

  try {
    const newSlide = await generateJSON<Slide>({
      model: DEFAULT_MODEL,
      maxTokens: 1024,
      prompt,
    });

    // Generate image if prompt provided
    if (newSlide.image_prompt) {
      const base64 = await generateSlideImage(newSlide.image_prompt);
      if (base64) {
        const imageUrl = await uploadImageToStorage(admin, base64, id, slideIndex);
        if (imageUrl) newSlide.image_url = imageUrl;
      }
    }

    // Update just that one slide in the JSONB array
    const updatedSlides = [...slides];
    updatedSlides[slideIndex] = newSlide;

    await admin
      .from('presentations')
      .update({ slides: updatedSlides, updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ slide: newSlide });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[regenerate-slide] Failed:', message);
    return NextResponse.json({ error: 'Regeneration failed' }, { status: 500 });
  }
}
