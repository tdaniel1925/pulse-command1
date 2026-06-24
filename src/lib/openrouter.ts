/**
 * Content-generation AI client.
 *
 * PRIMARY path is Anthropic Claude Haiku 4.5 — fast, cheap ($1/$5 per MTok), and
 * reliable, which matters for user-facing generation (the landing-page builder).
 * The OpenRouter free tier is kept as an OPTIONAL cost-saving fallback but is OFF
 * by default, because its slugs are heavily rate-limited (frequent 429s) and add
 * latency. Set USE_FREE_MODELS_FIRST=true to try free OpenRouter models before
 * Anthropic when latency isn't critical (e.g. background cron generation).
 *
 * For stronger reasoning (website scanning, transcript analysis), call the
 * Anthropic SDK directly elsewhere.
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1/messages';

// Anthropic models. Haiku 4.5 is the default primary for short copy generation.
export const ANTHROPIC_PRIMARY_MODEL = 'claude-haiku-4-5';
export const ANTHROPIC_FALLBACK_MODEL = 'claude-sonnet-4-6'; // sturdier retry

// Optional OpenRouter free models (used only when USE_FREE_MODELS_FIRST is set).
export type OpenRouterModel =
  | 'google/gemma-4-31b-it:free'
  | 'google/gemma-4-26b-a4b-it:free'
  | 'qwen/qwen3-next-80b-a3b-instruct:free'
  | 'meta-llama/llama-3.3-70b-instruct:free';

// DEFAULT_MODEL / LIGHT_MODEL are kept as exported names (other modules import
// them) but now map to the OpenRouter free fallbacks, only consulted when
// free-first mode is enabled.
export const DEFAULT_MODEL: OpenRouterModel = 'google/gemma-4-31b-it:free';
export const LIGHT_MODEL: OpenRouterModel = 'google/gemma-4-26b-a4b-it:free';

const FREE_FALLBACKS: OpenRouterModel[] = [
  'google/gemma-4-31b-it:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-26b-a4b-it:free',
];

// Free-first mode is opt-in via env; default is Anthropic-primary for speed.
const USE_FREE_MODELS_FIRST = process.env.USE_FREE_MODELS_FIRST === 'true';

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

/** Call Anthropic Messages API. Anthropic has no system role in messages[], so
 *  the system prompt is hoisted to the top-level `system` field. */
async function callAnthropic(
  model: string,
  messages: OpenRouterMessage[],
  maxTokens: number,
): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
  const convo = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));
  if (convo.length === 0) convo.push({ role: 'user', content: system || 'Continue.' });

  const res = await fetch(ANTHROPIC_BASE_URL, {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: convo,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

/** Call an OpenRouter free model. Throws on non-2xx so the caller can fall back. */
async function callOpenRouter(
  model: OpenRouterModel,
  messages: OpenRouterMessage[],
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'PulseCommand',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
  });
  if (!res.ok) throw new Error(`OpenRouter API error (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as OpenRouterResponse;
  return data.choices[0]?.message?.content ?? '';
}

/**
 * Generate text. Default path: Anthropic Haiku 4.5 (fast, cheap, reliable),
 * retrying once on Sonnet 4.6 if Haiku errors. When USE_FREE_MODELS_FIRST is set,
 * the OpenRouter free chain is tried first and Anthropic is the fallback.
 */
export async function generateText(params: {
  model?: OpenRouterModel;
  messages: OpenRouterMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const maxTokens = params.maxTokens ?? 2048;
  const temperature = params.temperature ?? 0.7;

  // Optional free-first mode (background jobs where latency doesn't matter).
  if (USE_FREE_MODELS_FIRST && process.env.OPENROUTER_API_KEY) {
    for (const model of FREE_FALLBACKS) {
      try {
        return await callOpenRouter(model, params.messages, maxTokens, temperature);
      } catch (err) {
        console.warn(`[ai] free model ${model} failed, trying next:`, err instanceof Error ? err.message : err);
      }
    }
    console.warn('[ai] all free models failed; falling back to Anthropic.');
  }

  // Primary: Anthropic Haiku 4.5, then Sonnet 4.6 on error.
  try {
    return await callAnthropic(ANTHROPIC_PRIMARY_MODEL, params.messages, maxTokens);
  } catch (primaryErr) {
    console.warn(`[ai] ${ANTHROPIC_PRIMARY_MODEL} failed, retrying on ${ANTHROPIC_FALLBACK_MODEL}:`, primaryErr instanceof Error ? primaryErr.message : primaryErr);
    return await callAnthropic(ANTHROPIC_FALLBACK_MODEL, params.messages, maxTokens);
  }
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
