/**
 * Middleware to check if user is authenticated
 * Verifies that a valid session exists
 */
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }
  next();
};

/**
 * Middleware to check if user has admin role
 * Must be used after requireAuth middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Optional authentication middleware
 * Adds user to request if authenticated, but doesn't block if not
 */
const optionalAuth = (req, res, next) => {
  // User info already in session if authenticated
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
};
