/**
 * In-Memory Rate Limiter
 *
 * Sliding window rate limiter using Map storage.
 * Ideal for local development and SQLite-first architecture.
 * Can be extended with Redis adapter for production.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RequestRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed under rate limit.
   * Returns { allowed: boolean, remaining: number, resetAt: Date }
   */
  check(identifier: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
  } {
    const now = Date.now();
    const record = this.store.get(identifier);

    // No previous record or window expired → allow and create new record
    if (!record || now >= record.resetTime) {
      const resetTime = now + config.windowMs;
      this.store.set(identifier, {
        count: 1,
        resetTime
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(resetTime)
      };
    }

    // Within window → check if limit exceeded
    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.resetTime),
        retryAfter
      };
    }

    // Within limit → increment count
    record.count += 1;
    this.store.set(identifier, record);

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: new Date(record.resetTime)
    };
  }

  /**
   * Remove expired entries from store
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current store size (for debugging)
   */
  getStoreSize() {
    return this.store.size;
  }

  /**
   * Clear all rate limit records (for testing)
   */
  reset() {
    this.store.clear();
  }

  /**
   * Destroy rate limiter and cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Default rate limit configuration per route
 * These are fallback values - actual limits are fetched from AppSettings
 */
export const RATE_LIMITS = {
  AI_GENERATE: {
    maxRequests: 20,
    windowMs: 60 * 1000 // 1 minute
  },
  AI_REWRITE: {
    maxRequests: 30,
    windowMs: 60 * 1000 // 1 minute
  },
  API_DEFAULT: {
    maxRequests: 60,
    windowMs: 60 * 1000 // 1 minute
  }
} as const;

/**
 * Get rate limit config from database (AppSettings)
 * Falls back to default if not configured
 */
export async function getRateLimitConfig(type: 'AI_GENERATE' | 'AI_REWRITE' | 'API_DEFAULT'): Promise<RateLimitConfig> {
  try {
    // Import prisma dynamically to avoid circular dependencies
    const { default: prisma } = await import('@/lib/prisma');
    const settings = await prisma.appSettings.findUnique({ where: { id: 'global' } });

    if (!settings) {
      return RATE_LIMITS[type];
    }

    if (type === 'AI_GENERATE') {
      return {
        maxRequests: settings.rateLimitGenerate || RATE_LIMITS.AI_GENERATE.maxRequests,
        windowMs: RATE_LIMITS.AI_GENERATE.windowMs
      };
    }

    if (type === 'AI_REWRITE') {
      return {
        maxRequests: settings.rateLimitRewrite || RATE_LIMITS.AI_REWRITE.maxRequests,
        windowMs: RATE_LIMITS.AI_REWRITE.windowMs
      };
    }

    return RATE_LIMITS[type];
  } catch (error) {
    console.error('Failed to fetch rate limit config, using defaults:', error);
    return RATE_LIMITS[type];
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to generic identifier (localhost in dev)
  return 'localhost';
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
) {
  return rateLimiter.check(identifier, config);
}

/**
 * Middleware wrapper for Next.js API routes
 *
 * Usage:
 * ```ts
 * export async function POST(req: Request) {
 *   const rateLimitResult = await withRateLimit(req, 'AI_GENERATE');
 *   if (!rateLimitResult.allowed) {
 *     return rateLimitResult.response;
 *   }
 *   // ... rest of handler
 * }
 * ```
 */
export async function withRateLimit(
  req: Request,
  configOrType: RateLimitConfig | 'AI_GENERATE' | 'AI_REWRITE' | 'API_DEFAULT'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  response?: Response;
}> {
  // If type string is passed, fetch config from database
  const config = typeof configOrType === 'string'
    ? await getRateLimitConfig(configOrType)
    : configOrType;
  const identifier = getClientIdentifier(req);
  const result = checkRateLimit(identifier, config);

  if (!result.allowed) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(config.maxRequests),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': result.resetAt.toISOString(),
      'Retry-After': String(result.retryAfter || 60)
    });

    return {
      allowed: false,
      remaining: 0,
      resetAt: result.resetAt,
      response: new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please wait ${result.retryAfter} seconds before retrying.`,
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers
        }
      )
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetAt: result.resetAt
  };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  config: RateLimitConfig,
  remaining: number,
  resetAt: Date
): Response {
  response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', resetAt.toISOString());
  return response;
}

export default rateLimiter;
