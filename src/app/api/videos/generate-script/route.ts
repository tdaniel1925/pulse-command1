import { NextRequest, NextResponse } from 'next/server'
import { generate, LIGHT_MODEL } from '@/lib/openrouter'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topic } = await request.json()
    if (!topic?.trim()) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    const script = await generate({
      model: LIGHT_MODEL,
      maxTokens: 600,
      prompt: `Write a 60-second professional video script for: ${topic}. Format: natural spoken language, no stage directions, no [PAUSE] markers. Length: approximately 150 words. Tone: professional but conversational. Start with a hook. End with a clear call to action. Return ONLY the script text, nothing else.`,
    })

    return NextResponse.json({ script: script.trim() })
  } catch (err) {
    console.error('[generate-script] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
