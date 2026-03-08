/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

const { doubleCsrf } = require('csrf-csrf');

// Configure CSRF protection - doubleCsrf returns utilities object
const {
  generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'indigenous-archive-csrf-secret',
  getSessionIdentifier: (req) => {
    // Try multiple sources for session identifier
    const sessionId = req.session?.id || req.sessionID || req.headers['x-session-id'] || 'test-session';
    return sessionId;
  },
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-csrf-token' : 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => {
    // Check multiple sources for CSRF token
    return req.headers['x-csrf-token'] || 
           req.body._csrf || 
           req.query._csrf;
  }
});

/**
 * Middleware to generate and attach CSRF token to response
 */
const csrfTokenGenerator = (req, res, next) => {
  // Skip CSRF in test environment
  if (process.env.NODE_ENV === 'test') {
    res.locals.csrfToken = 'test-token';
    return next();
  }
  
  try {
    // Generate token using the csrf-csrf API
    const token = generateCsrfToken(req, res);
    
    // Attach token to response locals for use in views
    res.locals.csrfToken = token;
    
    // Also send in response header for API clients
    if (token) {
      res.setHeader('X-CSRF-Token', token);
    }
    
    next();
  } catch (error) {
    console.error('CSRF token generation failed:', error.message);
    console.error('Session ID:', req.session?.id || req.sessionID);
    console.error('Has session:', !!req.session);
    // Don't fail the request, just log the error and continue
    next();
  }
};

/**
 * Error handler for CSRF validation failures
 */
const csrfErrorHandler = (error, req, res, next) => {
  if (error.code === 'EBADCSRFTOKEN' || error.message?.includes('csrf')) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh the page and try again.',
      code: 'CSRF_VALIDATION_FAILED'
    });
  }
  next(error);
};

module.exports = {
  csrfTokenGenerator,
  csrfProtection: process.env.NODE_ENV === 'test' ? (req, res, next) => next() : doubleCsrfProtection,
  csrfErrorHandler
};
