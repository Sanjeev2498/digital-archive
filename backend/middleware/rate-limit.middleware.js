const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login endpoint
 * Prevents brute force attacks by limiting login attempts
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // High limit in tests to avoid flaky tests
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
    });
  }
});

/**
 * Rate limiter for registration endpoint
 * Prevents spam registrations
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'test' ? 1000 : 3, // High limit in tests to avoid flaky tests
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP. Please try again after 1 hour.'
    });
  }
});

/**
 * General API rate limiter
 * Applies to all API endpoints as a baseline protection
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please slow down.'
    });
  }
});

/**
 * Reset rate limiters (for testing)
 */
function resetRateLimiters() {
  // Reset for both IPv4 and IPv6 localhost
  const ips = ['::ffff:127.0.0.1', '127.0.0.1', '::1'];
  
  ips.forEach(ip => {
    if (loginLimiter.resetKey) {
      loginLimiter.resetKey(ip);
    }
    if (registrationLimiter.resetKey) {
      registrationLimiter.resetKey(ip);
    }
    if (apiLimiter.resetKey) {
      apiLimiter.resetKey(ip);
    }
  });
}

module.exports = {
  loginLimiter,
  registrationLimiter,
  apiLimiter,
  resetRateLimiters
};
