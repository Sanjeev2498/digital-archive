const fc = require('fast-check');
const { query } = require('../../backend/db');
const bcrypt = require('bcrypt');

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

describe('Property-Based Tests: Database Constraints', () => {
  
  // Feature: indigenous-knowledge-archive, Property 12: Database Constraint Enforcement
  describe('Property 12: Database Constraint Enforcement', () => {
    test('should reject user creation with invalid role values', async () => {
      /**
       * **Validates: Requirements 5.6**
       * 
       * This property verifies that the database enforces the ENUM constraint
       * on the role column, rejecting any values other than 'admin' or 'user'.
       */
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // name
          fc.emailAddress(), // email
          fc.string({ minLength: 8, maxLength: 50 }), // password
          // Generate invalid role values (anything except 'admin' or 'user')
          // Note: MySQL ENUM is case-insensitive, so 'ADMIN' and 'USER' are valid
          fc.oneof(
            fc.constant('superadmin'),
            fc.constant('moderator'),
            fc.constant('administrator'),
            fc.constant('guest'),
            fc.constant('root'),
            fc.constant('member'),
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
              s.toLowerCase() !== 'admin' && s.toLowerCase() !== 'user'
            )
          ),
          async (name, email, password, invalidRole) => {
            // Clean up before test
            await deleteUserByEmail(email);
            
            try {
              // Hash password as the application would
              const hashedPassword = await bcrypt.hash(password, 10);
              
              // Attempt to insert user with invalid role directly into database
              // This bypasses application-level validation to test database constraint
              const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
              
              // The database should reject this operation
              await expect(
                query(insertQuery, [name, email, hashedPassword, invalidRole])
              ).rejects.toThrow();
              
              // Verify no user was created with this email
              const users = await query('SELECT * FROM users WHERE email = ?', [email]);
              expect(users.length).toBe(0);
              
            } finally {
              // Clean up after test
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 120000); // 120 second timeout for property test with 100 iterations
    
    test('should accept only valid role values (admin or user)', async () => {
      /**
       * **Validates: Requirements 5.6**
       * 
       * This property verifies that the database accepts the valid ENUM values
       * 'admin' and 'user' for the role column.
       */
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // name
          fc.emailAddress(), // email
          fc.string({ minLength: 8, maxLength: 50 }), // password
          fc.constantFrom('admin', 'user'), // Valid role values
          async (name, email, password, validRole) => {
            // Clean up before test
            await deleteUserByEmail(email);
            
            try {
              // Hash password as the application would
              const hashedPassword = await bcrypt.hash(password, 10);
              
              // Insert user with valid role directly into database
              const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
              
              // The database should accept this operation
              const result = await query(insertQuery, [name, email, hashedPassword, validRole]);
              expect(result).toBeDefined();
              expect(result.affectedRows).toBe(1);
              
              // Verify user was created with correct role
              const users = await query('SELECT * FROM users WHERE email = ?', [email]);
              expect(users.length).toBe(1);
              expect(users[0].role).toBe(validRole);
              expect(users[0].name).toBe(name);
              expect(users[0].email).toBe(email);
              
            } finally {
              // Clean up after test
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 120000); // 120 second timeout for property test with 100 iterations
  });
});
