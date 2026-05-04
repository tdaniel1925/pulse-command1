import { NextResponse } from "next/server";
import { generateJSON, LIGHT_MODEL } from "@/lib/openrouter";

export async function POST(request: Request) {
  const body = await request.json();
  const { topic, businessName, tone } = body;

  if (!topic || !businessName) {
    return NextResponse.json({ error: "topic and businessName are required" }, { status: 400 });
  }

  let parsed: { subject: string; html: string; text: string };
  try {
    parsed = await generateJSON<{ subject: string; html: string; text: string }>({
      model: LIGHT_MODEL,
      maxTokens: 1500,
      prompt: `Write a professional email newsletter for ${businessName} about: ${topic}. Tone: ${tone ?? "professional"}. Return JSON: { "subject": "...", "html": "<full HTML email body>", "text": "plain text version" }. The HTML should be clean inline-styled email HTML suitable for Resend. Keep it under 500 words.`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  return NextResponse.json({ subject: parsed.subject, html: parsed.html, text: parsed.text });
}
