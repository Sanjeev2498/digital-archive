/**
 * Validation Module
 * Client-side input validation utilities
 */

const ValidationService = {
  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid email format
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validate password strength
   * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
   * @param {string} password - Password to validate
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validatePassword(password) {
    const errors = [];
    
    if (!password || typeof password !== 'string') {
      return { valid: false, errors: ['Password is required'] };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Validate required field
   * @param {string} value - Value to validate
   * @returns {boolean} True if not empty
   */
  validateRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  },

  /**
   * Sanitize input to prevent XSS
   * @param {string} input - Input string to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Validate name (no special characters except spaces, hyphens, apostrophes)
   * @param {string} name - Name to validate
   * @returns {boolean} True if valid name
   */
  validateName(name) {
    if (!this.validateRequired(name)) return false;
    
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name.trim()) && name.trim().length <= 100;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.ValidationService = ValidationService;
}
