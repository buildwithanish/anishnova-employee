type RateBucket = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var rateLimitStore: Map<string, RateBucket> | undefined;
}

const store = global.rateLimitStore || new Map<string, RateBucket>();
global.rateLimitStore = store;

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    const next = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, next);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: next.resetAt,
    };
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  store.set(key, bucket);

  return {
    success: true,
    remaining: Math.max(limit - bucket.count, 0),
    resetAt: bucket.resetAt,
  };
}
