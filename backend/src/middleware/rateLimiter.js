const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for all API routes.
 * Limits each IP to 100 requests per 15 minutes.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for the analysis endpoint.
 * Limits each IP to 7 resume scans per 10 minutes.
 */
const analyzeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 7 requests per window
  message: {
    error: 'Scan limit reached. Please wait 10 minutes before analyzing more resumes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  analyzeLimiter
};
