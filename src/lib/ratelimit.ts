import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Use mock cache if env vars are missing to prevent local dev from breaking
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

const isRedisConfigured = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only if configured
export const redis = isRedisConfigured
  ? new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Helper to create rate limiters safely (fallback to bypassing if Redis is missing)
export function createRateLimiter(limit: number, duration: `${number} s` | `${number} m` | `${number} h`) {
  if (!redis) {
    return {
      limit: async () => ({ success: true, limit, remaining: limit, reset: Date.now() }),
    };
  }

  return new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(limit, duration),
    analytics: true,
  });
}

// Pre-configured rate limiters
export const authRateLimit = createRateLimiter(5, "15 m"); // 5 login/signup attempts per 15 minutes
export const otpRateLimit = createRateLimiter(3, "10 m"); // 3 OTP requests per 10 minutes
export const apiRateLimit = createRateLimiter(30, "1 m"); // 30 API calls per minute (general endpoints)
export const chatRateLimit = createRateLimiter(60, "1 m"); // 60 messages per minute
