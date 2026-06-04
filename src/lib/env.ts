/**
 * Centralised environment access. Values are read lazily so that missing
 * credentials only error when a feature that needs them is actually used —
 * the app (and landing page) still builds and runs without any .env set.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  supabase: {
    get url() {
      return required("NEXT_PUBLIC_SUPABASE_URL");
    },
    get anonKey() {
      return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    },
    get serviceRoleKey() {
      return required("SUPABASE_SERVICE_ROLE_KEY");
    },
  },

  upstash: {
    get url() {
      return required("UPSTASH_REDIS_REST_URL");
    },
    get token() {
      return required("UPSTASH_REDIS_REST_TOKEN");
    },
  },

  gemini: {
    get apiKey() {
      return required("GEMINI_API_KEY");
    },
    model: optional("GEMINI_MODEL", "gemini-2.5-flash"),
  },
} as const;

/** True when the core integrations are configured (useful for graceful UI). */
export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
