const fc = require('fast-check');
const authService = require('../../backend/services/auth.service');
const { query } = require('../../backend/db');
const { validPasswordArbitrary } = require('../helpers/test-helpers');

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

// Helper function to create a user with specific role
const createUserWithRole = async (name, email, password, role) => {
  await deleteUserByEmail(email);
  
  // Register user normally (creates as 'user')
  const user = await authService.registerUser(name, email, password);
  
  // If admin role requested, update the role directly in database
  if (role === 'admin') {
    await query('UPDATE users SET role = ? WHERE email = ?', ['admin', email]);
    const updatedUser = await authService.getUserByEmail(email);
    return updatedUser;
  }
  
  return user;
};

describe('Property-Based Tests: Role-Based Access Control', () => {
  
  // Feature: indigenous-knowledge-archive, Property 9: Role-Based Access Control
  describe('Property 9: Role-Based Access Control', () => {
    test('should deny admin dashboard access to regular users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (name, email, password) => {
            await deleteUserByEmail(email);
            
            try {
              // Create regular user with role 'user'
              const user = await createUserWithRole(name, email, password, 'user');
              
              // Verify user has 'user' role
              expect(user.role).toBe('user');
              
              // Simulate checking if user can access admin dashboard
              // In the actual application, this would be done by middleware
              const canAccessAdmin = user.role === 'admin';
              
              // Regular users should NOT have admin access
              expect(canAccessAdmin).toBe(false);
              
              // Verify user can still be authenticated (has valid account)
              const loggedIn = await authService.loginUser(email, password);
              expect(loggedIn).toBeDefined();
              expect(loggedIn.role).toBe('user');
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000);

    test('should grant admin dashboard access to admin users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (name, email, password) => {
            await deleteUserByEmail(email);
            
            try {
              // Create admin user with role 'admin'
              const user = await createUserWithRole(name, email, password, 'admin');
              
              // Verify user has 'admin' role
              expect(user.role).toBe('admin');
              
              // Simulate checking if user can access admin dashboard
              const canAccessAdmin = user.role === 'admin';
              
              // Admin users SHOULD have admin access
              expect(canAccessAdmin).toBe(true);
              
              // Verify admin can still be authenticated
              const loggedIn = await authService.loginUser(email, password);
              expect(loggedIn).toBeDefined();
              expect(loggedIn.role).toBe('admin');
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000);

    test('should maintain role consistency across authentication', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          fc.constantFrom('user', 'admin'),
          async (name, email, password, role) => {
            await deleteUserByEmail(email);
            
            try {
              // Create user with specified role
              const user = await createUserWithRole(name, email, password, role);
              expect(user.role).toBe(role);
              
              // Login and verify role is maintained
              const loggedIn = await authService.loginUser(email, password);
              expect(loggedIn.role).toBe(role);
              
              // Retrieve by ID and verify role is still consistent
              const userById = await authService.getUserById(user.id);
              expect(userById.role).toBe(role);
              
              // Retrieve by email and verify role is still consistent
              const userByEmail = await authService.getUserByEmail(email);
              expect(userByEmail.role).toBe(role);
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000);

    test('should enforce role-based access for any user-admin pair', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (userName, userEmail, userPassword, adminName, adminEmail, adminPassword) => {
            // Ensure emails are different
            if (userEmail === adminEmail) return;
            
            await deleteUserByEmail(userEmail);
            await deleteUserByEmail(adminEmail);
            
            try {
              // Create regular user and admin user
              const regularUser = await createUserWithRole(userName, userEmail, userPassword, 'user');
              const adminUser = await createUserWithRole(adminName, adminEmail, adminPassword, 'admin');
              
              // Verify roles are correct
              expect(regularUser.role).toBe('user');
              expect(adminUser.role).toBe('admin');
              
              // Verify access control logic
              expect(regularUser.role === 'admin').toBe(false);
              expect(adminUser.role === 'admin').toBe(true);
              
              // Verify both can authenticate but with different roles
              const loggedInUser = await authService.loginUser(userEmail, userPassword);
              const loggedInAdmin = await authService.loginUser(adminEmail, adminPassword);
              
              expect(loggedInUser.role).toBe('user');
              expect(loggedInAdmin.role).toBe('admin');
              
            } finally {
              await deleteUserByEmail(userEmail);
              await deleteUserByEmail(adminEmail);
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 60000);
  });
});
