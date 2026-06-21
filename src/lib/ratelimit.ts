import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

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
export function createRateLimiter(limit: number, duration: `${number} s` | `${number} m` | `${number} h` | `${number} d`) {
  if (!redis) {
    return {
      limit: async () => ({ success: true, limit, remaining: limit, reset: Date.now() }),
    };
  }

  return new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(limit, duration as any), // Types might not natively support 'd', but slidingWindow does internally.
    analytics: true,
  });
}

// Authentication
export const authRateLimit = createRateLimiter(5, "15 m");
export const signupRateLimit = createRateLimiter(3, "1 h");
export const forgotPasswordRateLimit = createRateLimiter(3, "1 h");
export const otpSendRateLimit = createRateLimiter(3, "10 m");
export const otpVerifyRateLimit = createRateLimiter(10, "10 m");

// Messaging
export const messageRateLimit = createRateLimiter(30, "1 m");

// Reviews
export const reviewRateLimit = createRateLimiter(5, "1 h");

// Orders
export const orderPlaceRateLimit = createRateLimiter(10, "10 m");
export const orderCancelRateLimit = createRateLimiter(5, "1 h");

// Listings
export const listingCreateRateLimit = createRateLimiter(10, "24 h");
export const listingEditRateLimit = createRateLimiter(30, "24 h");
export const listingDeleteRateLimit = createRateLimiter(10, "24 h");

// Products
export const productCreateRateLimit = createRateLimiter(20, "24 h");
export const productEditRateLimit = createRateLimiter(50, "24 h");
export const productDeleteRateLimit = createRateLimiter(20, "24 h");

// Seller Verification
export const verificationSubmitRateLimit = createRateLimiter(2, "7 d");

// File Uploads
export const uploadImageRateLimit = createRateLimiter(30, "24 h");
export const uploadDocRateLimit = createRateLimiter(10, "7 d");
export const uploadQrRateLimit = createRateLimiter(5, "30 d");

// Search
export const searchListingsRateLimit = createRateLimiter(120, "1 m");
export const searchProductsRateLimit = createRateLimiter(120, "1 m");

// Contact Seller / Inquiries
export const requestInquiryRateLimit = createRateLimiter(20, "1 h");

// General API Rate Limit (fallback)
export const apiRateLimit = createRateLimiter(30, "1 m");


// --- Helpers ---

export function getIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return "127.0.0.1";
}

export async function checkRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  identifier: string,
  isAdmin: boolean = false
) {
  if (isAdmin || !redis) return null;

  const { success } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return null;
}

export async function checkRateLimitWithLog(
  limiter: ReturnType<typeof createRateLimiter>,
  identifier: string,
  action: string,
  isAdmin: boolean = false
) {
  if (isAdmin || !redis) return null;

  const { success } = await limiter.limit(identifier);

  if (!success) {
    logger.warn(`[RATE LIMIT EXCEEDED] Action: ${action} | Identifier: ${identifier}`);
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return null;
}
