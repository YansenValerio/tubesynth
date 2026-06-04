import "server-only";

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

  const result = await model.generateContent(prompt);
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
  const result = await model.generateContent(prompt);
  const usage = result.response.usageMetadata;
  return {
    text: result.response.text().trim(),
    tokensInput: usage?.promptTokenCount ?? 0,
    tokensOutput: usage?.candidatesTokenCount ?? 0,
  };
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
