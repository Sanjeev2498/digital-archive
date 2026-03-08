const fc = require('fast-check');

/**
 * Helper function to generate valid passwords for testing
 * Passwords must have: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
const validPasswordArbitrary = () => {
  return fc.string({ minLength: 5, maxLength: 47 }).map(s => {
    // Ensure password meets all requirements
    return 'Aa1' + s + 'Bb2'; // Prefix and suffix ensure all requirements are met
  });
};

module.exports = {
  validPasswordArbitrary
};
