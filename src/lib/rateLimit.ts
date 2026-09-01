// Minimal in-memory per-IP rate limiter - zero cost, no external service.
// Caveat: this state lives in the Node process, so it resets on redeploy
// and isn't shared across multiple server instances. Fine for a single
// server/small deployment; swap for a shared store (e.g. Upstash Redis)
// if you scale to multiple instances.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
