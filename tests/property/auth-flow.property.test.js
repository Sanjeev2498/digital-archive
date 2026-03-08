const fc = require('fast-check');
const request = require('supertest');
const authService = require('../../backend/services/auth.service');
const { query } = require('../../backend/db');
const { validPasswordArbitrary } = require('../helpers/test-helpers');

// Note: These tests require the Express app to be running
// For now, we'll test the service layer directly

// Test configuration: reduced iterations for faster execution
const testConfig = { numRuns: 20 };

const deleteUserByEmail = async (email) => {
  try {
    await query('DELETE FROM users WHERE email = ?', [email]);
  } catch (error) {
    // Ignore
  }
};

describe('Property-Based Tests: Authentication Flow', () => {
  
  // Feature: indigenous-knowledge-archive, Property 4: Authentication Flow Integrity
  describe('Property 4: Authentication Flow Integrity', () => {
    test('should maintain authentication state for valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (name, email, password) => {
            await deleteUserByEmail(email);
            
            try {
              // Register user
              const registered = await authService.registerUser(name, email, password);
              expect(registered).toBeDefined();
              
              // Login with correct credentials should succeed
              const loggedIn = await authService.loginUser(email, password);
              expect(loggedIn).toBeDefined();
              expect(loggedIn.id).toBe(registered.id);
              expect(loggedIn.email).toBe(email);
              expect(loggedIn.role).toBe('user');
              expect(loggedIn.password).toBeUndefined(); // Password should not be returned
              
              // Verify user can be retrieved by ID
              const userById = await authService.getUserById(loggedIn.id);
              expect(userById).toBeDefined();
              expect(userById.email).toBe(email);
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000);
  });

  // Feature: indigenous-knowledge-archive, Property 5: Invalid Credentials Handling
  describe('Property 5: Invalid Credentials Handling', () => {
    test('should reject login with wrong password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          validPasswordArbitrary(),
          async (name, email, correctPassword, wrongPassword) => {
            // Ensure passwords are different
            if (correctPassword === wrongPassword) return;
            
            await deleteUserByEmail(email);
            
            try {
              // Register user with correct password
              await authService.registerUser(name, email, correctPassword);
              
              // Login with wrong password should fail
              await expect(
                authService.loginUser(email, wrongPassword)
              ).rejects.toThrow(/invalid credentials/i);
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000);

    test('should reject login with non-existent email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (email, password) => {
            await deleteUserByEmail(email);
            
            try {
              // Login with non-existent email should fail
              await expect(
                authService.loginUser(email, password)
              ).rejects.toThrow(/invalid credentials/i);
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    test('should not reveal whether email or password was incorrect', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          fc.emailAddress(),
          validPasswordArbitrary(),
          validPasswordArbitrary(),
          async (name, validEmail, invalidEmail, correctPassword, wrongPassword) => {
            // Ensure emails are different
            if (validEmail === invalidEmail) return;
            
            await deleteUserByEmail(validEmail);
            await deleteUserByEmail(invalidEmail);
            
            try {
              // Register user
              await authService.registerUser(name, validEmail, correctPassword);
              
              // Get error message for wrong password
              let wrongPasswordError;
              try {
                await authService.loginUser(validEmail, wrongPassword);
              } catch (error) {
                wrongPasswordError = error.message;
              }
              
              // Get error message for wrong email
              let wrongEmailError;
              try {
                await authService.loginUser(invalidEmail, correctPassword);
              } catch (error) {
                wrongEmailError = error.message;
              }
              
              // Both errors should be the same generic message
              expect(wrongPasswordError).toBeDefined();
              expect(wrongEmailError).toBeDefined();
              expect(wrongPasswordError.toLowerCase()).toContain('invalid credentials');
              expect(wrongEmailError.toLowerCase()).toContain('invalid credentials');
              
            } finally {
              await deleteUserByEmail(validEmail);
              await deleteUserByEmail(invalidEmail);
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);
  });
});
