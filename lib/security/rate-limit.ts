interface RateLimitEntry {
  count: number;
  reset: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

function hasKvEnv(): boolean {
  return Boolean(process.env.KV_REST_API_URL?.trim() && process.env.KV_REST_API_TOKEN?.trim());
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.reset) {
    memoryStore.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, reset: entry.reset };
  }

  return { allowed: true, remaining: limit - entry.count, reset: entry.reset };
}

async function kvRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const { kv } = await import("@vercel/kv");
  const redisKey = `ratelimit:v1:${key}`;
  const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));
  const n = await kv.incr(redisKey);
  if (n === 1) {
    await kv.expire(redisKey, ttlSec);
  }
  const reset = Date.now() + ttlSec * 1000;
  if (n > limit) {
    return { allowed: false, remaining: 0, reset };
  }
  return { allowed: true, remaining: limit - n, reset };
}

/**
 * Fixed-window limiter. Uses Vercel KV when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set;
 * otherwise in-memory (single instance only).
 */
export async function rateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  if (hasKvEnv()) {
    try {
      return await kvRateLimit(key, limit, windowMs);
    } catch {
      return memoryRateLimit(key, limit, windowMs);
    }
  }
  return memoryRateLimit(key, limit, windowMs);
}

export function clearRateLimit(key: string): void {
  memoryStore.delete(key);
}
