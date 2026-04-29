import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const body = await request.json();
  const { topic, businessName, tone } = body;

  if (!topic || !businessName) {
    return NextResponse.json({ error: "topic and businessName are required" }, { status: 400 });
  }

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Write a professional email newsletter for ${businessName} about: ${topic}. Tone: ${tone ?? "professional"}. Return JSON: { "subject": "...", "html": "<full HTML email body>", "text": "plain text version" }. The HTML should be clean inline-styled email HTML suitable for Resend. Keep it under 500 words.`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from the response (may be wrapped in markdown code blocks)
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, raw];
  const jsonStr = jsonMatch[1]?.trim() ?? raw.trim();

  let parsed: { subject: string; html: string; text: string };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
  }

  return NextResponse.json({ subject: parsed.subject, html: parsed.html, text: parsed.text });
}
