// Small in-memory rate limiter (no extra dependency). Counts requests per key
// in a sliding window. Fine for a single server; counts reset on restart.
const createRateLimiter = ({ windowMs, max, message, keyFor = (req) => req.ip }) => {
  const hits = new Map();

  // Forget old entries every few minutes so memory stays small.
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, times] of hits) {
      const recent = times.filter((t) => t > cutoff);
      if (recent.length) hits.set(key, recent);
      else hits.delete(key);
    }
  }, Math.min(windowMs, 5 * 60 * 1000)).unref();

  return (req, res, next) => {
    const key = keyFor(req) || 'unknown';
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => t > now - windowMs);
    if (recent.length >= max) {
      const retryAfter = Math.ceil((recent[0] + windowMs - now) / 1000);
      res.set('Retry-After', String(Math.max(retryAfter, 1)));
      return res.status(429).json({ error: message });
    }
    recent.push(now);
    hits.set(key, recent);
    return next();
  };
};

module.exports = { createRateLimiter };
