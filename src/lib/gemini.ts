// Server-side only (uses GEMINI_API_KEY). Shared by Next routes and the
// Trigger.dev worker, so no `server-only` guard.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (client) return client;
  client = new GoogleGenerativeAI(env.gemini.apiKey);
  return client;
}

export interface GeminiResult<T> {
  data: T;
  tokensInput: number;
  tokensOutput: number;
}

/**
 * Run a prompt and parse the model's JSON response. Uses JSON response mode so
 * the model returns a bare object. Strips accidental code fences defensively.
 */
export async function generateJson<T>(
  prompt: string,
  modelName: string = env.gemini.model,
): Promise<GeminiResult<T>> {
  const model = getClient().getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const result = await withRetry(() => model.generateContent(prompt));
  const response = result.response;
  const text = response.text();

  const usage = response.usageMetadata;

  return {
    data: parseJson<T>(text),
    tokensInput: usage?.promptTokenCount ?? 0,
    tokensOutput: usage?.candidatesTokenCount ?? 0,
  };
}

/** Run a prompt and return plain text (used for conversational Q&A). */
export async function generateText(
  prompt: string,
  modelName: string = env.gemini.model,
): Promise<{ text: string; tokensInput: number; tokensOutput: number }> {
  const model = getClient().getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.5 },
  });
  const result = await withRetry(() => model.generateContent(prompt));
  const usage = result.response.usageMetadata;
  return {
    text: result.response.text().trim(),
    tokensInput: usage?.promptTokenCount ?? 0,
    tokensOutput: usage?.candidatesTokenCount ?? 0,
  };
}

/**
 * Retry on 429 rate-limit errors, honoring Google's suggested retry delay
 * (free tier is ~5 requests/minute). Other errors propagate immediately.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 6): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = /\b429\b|too many requests|quota|rate.?limit/i.test(msg);
      if (!isRateLimit || attempt >= maxRetries) throw err;

      // Prefer the server-suggested delay; fall back to exponential backoff.
      const suggested =
        msg.match(/retry in ([\d.]+)\s*s/i)?.[1] ??
        msg.match(/"retryDelay":"([\d.]+)s"/)?.[1];
      const delayMs = suggested
        ? Math.ceil(parseFloat(suggested) * 1000) + 500
        : Math.min(2 ** attempt * 1000, 30000);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function parseJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Last resort: extract the outermost JSON object.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Model did not return valid JSON.");
  }
}
