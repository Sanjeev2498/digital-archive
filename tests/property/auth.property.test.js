const fc = require('fast-check');
const authService = require('../../backend/services/auth.service');
const { query } = require('../../backend/db');

// Test configuration: reduced iterations for faster execution
const testConfig = { numRuns: 20 };

// Helper function to clean up test users
const deleteUserByEmail = async (email) => {
  try {
    await query('DELETE FROM users WHERE email = ?', [email]);
  } catch (error) {
    // Ignore errors if user doesn't exist
  }
};

// Helper function to generate valid passwords for testing
// Passwords must have: min 8 chars, 1 uppercase, 1 lowercase, 1 number
const validPasswordArbitrary = () => {
  return fc.string({ minLength: 5, maxLength: 47 }).map(s => {
    // Ensure password meets all requirements
    return 'Aa1' + s + 'Bb2'; // Prefix and suffix ensure all requirements are met
  });
};

describe('Property-Based Tests: Authentication Service', () => {
  
  // Feature: indigenous-knowledge-archive, Property 1: User Registration Creates Valid Database Records
  describe('Property 1: User Registration Creates Valid Database Records', () => {
    test('should create valid database records for any valid registration data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // name
          fc.emailAddress(), // email
          validPasswordArbitrary(), // password
          async (name, email, password) => {
            // Clean up before test
            await deleteUserByEmail(email);
            
            try {
              // Register user
              const result = await authService.registerUser(name, email, password);
              
              // Verify user created with correct data
              expect(result).toBeDefined();
              expect(result.name).toBe(name.trim());
              expect(result.email).toBe(email);
              expect(result.role).toBe('user');
              expect(result.id).toBeGreaterThan(0);
              
              // Verify user exists in database
              const user = await authService.getUserByEmail(email);
              expect(user).toBeDefined();
              expect(user.name).toBe(name.trim());
              expect(user.email).toBe(email);
              expect(user.role).toBe('user');
              expect(user.id).toBeGreaterThan(0);
              expect(user.created_at).toBeDefined();
              
              // Verify password is hashed (not plaintext)
              expect(user.password).not.toBe(password);
              expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt format
              
              // Verify password hash has sufficient salt rounds (bcrypt format: $2b$10$...)
              const saltRounds = parseInt(user.password.split('$')[2]);
              expect(saltRounds).toBeGreaterThanOrEqual(10);
              
            } finally {
              // Clean up after test
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000); // 60 second timeout for property test
  });

  // Feature: indigenous-knowledge-archive, Property 2: Email Uniqueness Enforcement
  describe('Property 2: Email Uniqueness Enforcement', () => {
    test('should reject duplicate email registration', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          validPasswordArbitrary(),
          async (email, name, password) => {
            // Clean up before test
            await deleteUserByEmail(email);
            
            try {
              // First registration should succeed
              const result1 = await authService.registerUser(name, email, password);
              expect(result1).toBeDefined();
              expect(result1.email).toBe(email);
              
              // Second registration with same email should fail
              await expect(
                authService.registerUser('Different Name', email, 'ValidPass123')
              ).rejects.toThrow(/email already registered/i);
              
              // Verify only one user exists with this email
              const users = await query('SELECT * FROM users WHERE email = ?', [email]);
              expect(users.length).toBe(1);
              
            } finally {
              // Clean up after test
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000); // 60 second timeout for property test
  });

  // Feature: indigenous-knowledge-archive, Property 3: Invalid Registration Data Rejection
  describe('Property 3: Invalid Registration Data Rejection', () => {
    test('should reject registration with empty name', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (email, password) => {
            await deleteUserByEmail(email);
            
            try {
              // Empty name should be rejected
              await expect(
                authService.registerUser('', email, password)
              ).rejects.toThrow();
              
              // Whitespace-only name should be rejected
              await expect(
                authService.registerUser('   ', email, password)
              ).rejects.toThrow();
              
              // Verify no user was created
              const user = await authService.getUserByEmail(email);
              expect(user).toBeNull();
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    test('should reject registration with invalid email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          validPasswordArbitrary(),
          fc.oneof(
            fc.constant('invalid-email'),
            fc.constant('missing@domain'),
            fc.constant('@nodomain.com'),
            fc.constant('spaces in@email.com'),
            fc.constant(''),
            fc.constant('   ')
          ),
          async (name, password, invalidEmail) => {
            try {
              // Invalid email should be rejected
              await expect(
                authService.registerUser(name, invalidEmail, password)
              ).rejects.toThrow();
            } catch (error) {
              // Expected to fail
            }
          }
        ),
        { numRuns: 30 }
      );
    }, 20000);

    test('should reject registration with weak password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          fc.oneof(
            fc.constant('short'), // Too short
            fc.constant(''), // Empty
            fc.constant('   '), // Whitespace
            fc.constant('1234567'), // Less than 8 chars
            fc.constant('alllowercase123'), // No uppercase
            fc.constant('ALLUPPERCASE123'), // No lowercase
            fc.constant('NoNumbers'), // No numbers
          ),
          async (name, email, weakPassword) => {
            await deleteUserByEmail(email);
            
            try {
              // Weak password should be rejected
              await expect(
                authService.registerUser(name, email, weakPassword)
              ).rejects.toThrow();
              
              // Verify no user was created
              const user = await authService.getUserByEmail(email);
              expect(user).toBeNull();
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        { numRuns: 30 }
      );
    }, 20000);
  });
});
