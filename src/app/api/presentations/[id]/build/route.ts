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

interface PresentationRow {
  id: string;
  client_id: string;
  topic: string;
  audience: string | null;
  tone: string;
  slide_count: number;
  source_mode: string | null;
  source_content: string | null;
  source_url: string | null;
  slide_style: string | null;
  interview_answers: Record<string, string> | null;
}

interface ClientRow {
  business_name: string;
  metadata: { brand_colors?: string[] } | null;
}

function buildSourceContext(presentation: PresentationRow): string {
  const mode = presentation.source_mode ?? 'ai';

  if (mode === 'paste' && presentation.source_content) {
    return `═══ SOURCE MATERIAL (user-provided) ═══
The following content was provided by the user. Use it as the primary source of truth.
DO NOT invent facts not present in this material. Fill structural gaps with professional framing only.

${presentation.source_content}
═══ END SOURCE MATERIAL ═══`;
  }

  if (mode === 'url' && presentation.source_content) {
    return `═══ SOURCE MATERIAL (scraped from ${presentation.source_url ?? 'website'}) ═══
The following was extracted from the user's website. Build the presentation using this content.
Identify: what they do, who they serve, key benefits, proof points, and CTA.
DO NOT invent facts. Use only what's in this content.

${presentation.source_content}
═══ END SOURCE MATERIAL ═══`;
  }

  if (mode === 'interview' && presentation.interview_answers) {
    const qa = Object.entries(presentation.interview_answers)
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join('\n\n');
    return `═══ SOURCE MATERIAL (from user interview) ═══
The user answered these questions. Use their exact words and phrasing where possible.
This should feel like THEIR presentation, not a generic template.

${qa}
═══ END SOURCE MATERIAL ═══`;
  }

  return `No source material provided. Generate compelling, specific content based on the topic and brand.
Research what you know about this topic and create substantive, credible content.`;
}

function buildClaudePrompt(presentation: PresentationRow, client: ClientRow): string {
  const businessName = client.business_name ?? 'Our Company';
  const { topic, audience, tone, slide_count: slideCount } = presentation;
  const slideStyle = presentation.slide_style ?? 'regular';
  const brandColorsArr = client.metadata?.brand_colors ?? [];
  const brandColors = brandColorsArr.length > 0 ? brandColorsArr.join(', ') : null;
  const sourceContext = buildSourceContext(presentation);

  return `You are a world-class presentation designer and strategist. You create presentations that are used at board meetings, investor pitches, sales calls, and keynote stages. Your slides are specific, sharp, and visually intentional.

═══ PRESENTATION BRIEF ═══
Brand: ${businessName}
Topic: ${topic}
Audience: ${audience ?? 'General audience'}
Tone: ${tone}
Slides: ${slideCount}
Style: ${slideStyle === 'nano' ? 'NANO — ultra-minimal, one big idea per slide, massive typography, almost no text' : 'REGULAR — professional, structured, information-rich'}

${sourceContext}

═══ CONTENT RULES (NON-NEGOTIABLE) ═══
1. NO filler openers. Never start with "In today's fast-paced world" or similar.
2. Slide TITLES must be complete sentences or bold claims — not topic labels.
   BAD: "Revenue Growth"  GOOD: "Revenue grew 47% in 12 months"
   BAD: "Our Approach"   GOOD: "We do one thing and do it exceptionally well"
3. Bullets: maximum 6 per slide, maximum 12 words each. Short. Sharp. Scannable.
4. Every stat needs context. Don't just say "$2.4M" — say "$2.4M in ARR, up from $800K last year"
5. Hook slide (slide 2): must open with a surprising stat, bold question, or provocative statement
6. Rule of three: group ideas in threes where possible
7. Closing slide: specific CTA, not vague. "Book a 20-minute call" not "Contact us"
8. Speaker notes = what you SAY, not what's on the slide. Natural, conversational tone.
9. ${slideStyle === 'nano' ? 'NANO MODE: Each slide has ONE idea. Title is the entire message. Subtitle is optional one-line context. No bullets except on the one "details" slide.' : 'REGULAR MODE: Balance text and visual breathing room. Not every slide needs bullets.'}

═══ SLIDE LAYOUTS ═══
${slideStyle === 'nano' ? `NANO LAYOUTS (use ONLY these):
- "nano_statement": one powerful sentence as title, optional 6-word subtitle, full accent color background
- "nano_number": one massive statistic as title, tiny label as subtitle, minimal design
- "nano_question": rhetorical question as title, no subtitle needed
- "nano_quote": short quote as title (under 15 words), speaker name as subtitle
- "title": opening and closing only
- "bullets": use sparingly, max 1-2 per deck for supporting detail` : `REGULAR LAYOUTS (mix all of these):
- "title": opening/closing slides — title + subtitle
- "bullets": title + 3-5 bullet points (most common)
- "image_left": image fills left 40%, title + bullets right 60%
- "image_right": title + bullets left 60%, image fills right 40%
- "quote": large pull quote centered, small attribution below
- "stats": title + exactly 3 stat boxes formatted as "value|label" e.g. "$2.4M|ARR"
- "two_col": title + two equal columns of bullets
- "section": section divider — large title, short subtitle, accent background`}

═══ IMAGE PROMPTS ═══
For slides with image_left or image_right layouts, write a specific, vivid image_prompt.
- Describe the exact scene, not a category: "A founder writing on a whiteboard in a bright modern office, warm natural light, candid moment"
- NOT: "A business meeting" or "Professional people"
- Match the industry: ${businessName} is likely in [infer industry from topic/brand]
- Style: photorealistic, editorial quality, natural lighting, diverse subjects

═══ BRAND COLORS ═══
${brandColors ? `Use these brand colors as accent_color throughout: ${brandColors}
Rotate between them across slides for visual variety.` : `Use these accent colors and rotate: #6366f1, #8b5cf6, #06b6d4, #10b981`}

═══ OUTPUT FORMAT ═══
Return ONLY valid JSON. No markdown fences. No explanation. Just the JSON.

{
  "title": "The presentation title (compelling, specific)",
  "slides": [
    {
      "index": 0,
      "layout": "title",
      "title": "slide title",
      "subtitle": "subtitle or null",
      "body": null,
      "bullets": null,
      "image_prompt": "vivid scene description or null",
      "speaker_notes": "what you say out loud",
      "accent_color": "#6366f1"
    }
  ]
}`;
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

  // Fetch client — include metadata for brand colors
  const { data: client } = await admin
    .from('clients')
    .select('business_name, metadata')
    .eq('id', presentation.client_id)
    .single();

  const safeClient: ClientRow = {
    business_name: (client as { business_name?: string } | null)?.business_name ?? 'Our Company',
    metadata: (client as { metadata?: { brand_colors?: string[] } } | null)?.metadata ?? null,
  };

  const prompt = buildClaudePrompt(presentation as PresentationRow, safeClient);

  try {
    // Generate slides with Claude
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText =
      claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    // Strip markdown code fences if present
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[build] Generation failed:', message);

    await admin
      .from('presentations')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
