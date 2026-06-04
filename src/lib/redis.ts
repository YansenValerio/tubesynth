import "server-only";

/**
 * Upstash Redis client + rate limiting (PRD §7.4):
 *   - anonymous: 10 videos / hour per IP
 *   - authenticated: 50 videos / hour
 * Also used as a fast cache layer in front of Supabase.
 */
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "@/lib/env";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;
  redis = new Redis({ url: env.upstash.url, token: env.upstash.token });
  return redis;
}

let anonLimiter: Ratelimit | null = null;
let authLimiter: Ratelimit | null = null;

export function getAnonRateLimiter(): Ratelimit {
  if (anonLimiter) return anonLimiter;
  anonLimiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "rl:anon",
    analytics: true,
  });
  return anonLimiter;
}

export function getAuthRateLimiter(): Ratelimit {
  if (authLimiter) return authLimiter;
  authLimiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(50, "1 h"),
    prefix: "rl:auth",
    analytics: true,
  });
  return authLimiter;
}
