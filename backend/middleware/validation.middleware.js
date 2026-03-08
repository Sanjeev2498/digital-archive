const validator = require('validator');

/**
 * Sanitize input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

/**
 * Validate registration input
 */
const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Validate name
  if (!name || validator.isEmpty(name.trim())) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Validate email
  if (!email || validator.isEmpty(email.trim())) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Invalid email format');
  }

  // Validate password
  if (!password || validator.isEmpty(password)) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // Sanitize inputs
  req.body.name = sanitizeInput(name);
  req.body.email = validator.normalizeEmail(email);
  // Don't sanitize password - it should remain as-is for hashing

  next();
};

/**
 * Validate login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email || validator.isEmpty(email.trim())) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Invalid email format');
  }

  // Validate password
  if (!password || validator.isEmpty(password)) {
    errors.push('Password is required');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // Normalize email
  req.body.email = validator.normalizeEmail(email);

  next();
};

/**
 * Sanitize all string inputs in request body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string' && key !== 'password') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  sanitizeInput,
  sanitizeBody
};
