// Server-side only (uses GEMINI_API_KEY). Shared by Next routes and the
// Trigger.dev worker, so no `server-only` guard.
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;
  client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  return client;
}

export interface GeminiResult<T> {
  data: T;
  tokensInput: number;
  tokensOutput: number;
}

// Thinking is disabled (thinkingBudget: 0) — it adds latency and, on flash
// models, can consume the output budget and truncate JSON. We don't need it
// for structured extraction.
const NO_THINKING = { thinkingBudget: 0 } as const;

/**
 * Run a prompt and parse the model's JSON response (JSON response mode). On a
 * parse failure the request is regenerated a couple of times before giving up.
 */
export async function generateJson<T>(
  prompt: string,
  modelName: string = env.gemini.model,
): Promise<GeminiResult<T>> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await withRetry(() =>
      getClient().models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 8192,
          thinkingConfig: NO_THINKING,
        },
      }),
    );
    const usage = res.usageMetadata;
    try {
      return {
        data: parseJson<T>(res.text ?? ""),
        tokensInput: usage?.promptTokenCount ?? 0,
        tokensOutput: usage?.candidatesTokenCount ?? 0,
      };
    } catch (err) {
      lastErr = err; // malformed JSON — regenerate
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Model did not return valid JSON.");
}

/** Run a prompt and return plain text (used for conversational Q&A). */
export async function generateText(
  prompt: string,
  modelName: string = env.gemini.model,
): Promise<{ text: string; tokensInput: number; tokensOutput: number }> {
  const res = await withRetry(() =>
    getClient().models.generateContent({
      model: modelName,
      contents: prompt,
      config: { temperature: 0.5, thinkingConfig: NO_THINKING },
    }),
  );
  const usage = res.usageMetadata;
  return {
    text: (res.text ?? "").trim(),
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

      const suggested =
        msg.match(/retry in ([\d.]+)\s*s/i)?.[1] ??
        msg.match(/"?retryDelay"?:\s*"?([\d.]+)s/i)?.[1];
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
