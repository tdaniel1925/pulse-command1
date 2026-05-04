/**
 * OpenRouter AI Client
 *
 * Centralized client for all content generation AI calls.
 * Uses free/cheap models via OpenRouter for social posts, newsletters,
 * scripts, and other content generation tasks.
 *
 * For tasks requiring stronger reasoning (website scanning, transcript analysis),
 * continue using the Anthropic SDK directly.
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export type OpenRouterModel =
  | 'google/gemma-4-31b-it:free'
  | 'minimax/minimax-m2.5:free'
  | 'nvidia/nemotron-3-super-120b-a12b:free';

// Default model — Gemma 4 31B is strong at structured JSON output and content generation
export const DEFAULT_MODEL: OpenRouterModel = 'google/gemma-4-31b-it:free';

// Lighter model for simpler tasks (grading, short scripts, classification)
export const LIGHT_MODEL: OpenRouterModel = 'minimax/minimax-m2.5:free';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate text using OpenRouter API
 */
export async function generateText(params: {
  model?: OpenRouterModel;
  messages: OpenRouterMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'PulseCommand',
    },
    body: JSON.stringify({
      model: params.model ?? DEFAULT_MODEL,
      messages: params.messages,
      max_tokens: params.maxTokens ?? 2048,
      temperature: params.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Retry once with fallback model on rate limit or 404
    if ((response.status === 429 || response.status === 404) && (params.model ?? DEFAULT_MODEL) !== LIGHT_MODEL) {
      console.warn(`OpenRouter ${response.status}, retrying with fallback model...`);
      await new Promise(r => setTimeout(r, 1500));
      return generateText({ ...params, model: LIGHT_MODEL });
    }
    // Final fallback: try Anthropic if available
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && (response.status === 429 || response.status === 404)) {
      console.warn('OpenRouter exhausted, falling back to Anthropic...');
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: params.maxTokens ?? 2048,
          messages: params.messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
        }),
      });
      if (anthropicRes.ok) {
        const data = await anthropicRes.json();
        return data.content?.[0]?.text ?? '';
      }
    }
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  return data.choices[0]?.message?.content ?? '';
}

/**
 * Helper: Generate with a system prompt + user prompt (most common pattern)
 */
export async function generate(params: {
  system?: string;
  prompt: string;
  model?: OpenRouterModel;
  maxTokens?: number;
}): Promise<string> {
  const messages: OpenRouterMessage[] = [];
  if (params.system) {
    messages.push({ role: 'system', content: params.system });
  }
  messages.push({ role: 'user', content: params.prompt });

  return generateText({
    model: params.model,
    messages,
    maxTokens: params.maxTokens,
  });
}

/**
 * Helper: Generate and parse JSON response
 */
export async function generateJSON<T = unknown>(params: {
  system?: string;
  prompt: string;
  model?: OpenRouterModel;
  maxTokens?: number;
}): Promise<T> {
  const raw = await generate(params);

  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Try to extract JSON object or array
  const jsonMatch = cleaned.match(/[\[{][\s\S]*[\]}]/);
  if (!jsonMatch) {
    throw new Error(`No JSON found in response: ${cleaned.slice(0, 200)}`);
  }

  return JSON.parse(jsonMatch[0]) as T;
}
