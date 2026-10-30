import rateLimit from 'express-rate-limit';

/** General API rate limiter: 300 req / 15 min per IP */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

/** Strict limiter for the RSS fetch proxy: 60 req / 5 min per IP */
export const fetchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Feed fetch rate limit exceeded. Please slow down.' },
});

/** Discovery submission limiter: 1 req / hour per IP */
export const discoverySubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Co-subscription telemetry is capped at 1 sync/hour per anonymous user.',
  },
});
