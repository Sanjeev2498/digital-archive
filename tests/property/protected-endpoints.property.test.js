const fc = require('fast-check');
const request = require('supertest');
const app = require('../../backend/server');
const authService = require('../../backend/services/auth.service');
const { query } = require('../../backend/db');
const { validPasswordArbitrary } = require('../helpers/test-helpers');

const testConfig = { numRuns: 20 };

const deleteUserByEmail = async (email) => {
  try {
    await query('DELETE FROM users WHERE email = ?', [email]);
  } catch (error) {
    // Ignore
  }
};

describe('Property-Based Tests: Protected Endpoint Authentication', () => {
  
  // Feature: indigenous-knowledge-archive, Property 13: Protected Endpoint Authentication
  describe('Property 13: Protected Endpoint Authentication', () => {
    test('should reject requests without valid authentication', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (email, password) => {
            await deleteUserByEmail(email);
            
            try {
              const response = await request(app)
                .get('/api/auth/session')
                .expect('Content-Type', /json/);
              
              expect(response.status).toBe(401);
              expect(response.body.authenticated).toBe(false);
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    test('should accept requests with valid session', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (name, email, password) => {
            await deleteUserByEmail(email);
            
            try {
              await authService.registerUser(name, email, password);
              
              const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({ email, password })
                .expect('Content-Type', /json/);
              
              expect(loginResponse.status).toBe(200);
              
              const cookies = loginResponse.headers['set-cookie'];
              
              const sessionResponse = await request(app)
                .get('/api/auth/session')
                .set('Cookie', cookies)
                .expect('Content-Type', /json/);
              
              expect(sessionResponse.status).toBe(200);
              expect(sessionResponse.body.authenticated).toBe(true);
              expect(sessionResponse.body.user).toBeDefined();
              expect(sessionResponse.body.user.email).toBe(email);
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        testConfig
      );
    }, 60000);

    test('should reject requests with invalid session cookie', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 50 }),
          async (invalidCookie) => {
            const response = await request(app)
              .get('/api/auth/session')
              .set('Cookie', `connect.sid=${invalidCookie}`)
              .expect('Content-Type', /json/);
            
            expect(response.status).toBe(401);
            expect(response.body.authenticated).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    test.skip('should reject POST requests without CSRF token', async () => {
      // Note: CSRF protection is disabled in test environment
      // This test would need to run in a non-test environment to actually test CSRF
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (name, email, password) => {
            await deleteUserByEmail(email);
            
            try {
              const response = await request(app)
                .post('/api/auth/register')
                .send({ name, email, password })
                .expect('Content-Type', /json/);
              
              expect(response.status).toBe(403);
              expect(response.body.success).toBe(false);
              expect(response.body.code).toBe('CSRF_VALIDATION_FAILED');
              
              const user = await authService.getUserByEmail(email);
              expect(user).toBeNull();
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    test.skip('should accept POST requests with valid CSRF token', async () => {
      // Note: CSRF protection is disabled in test environment
      // This test would need to run in a non-test environment to actually test CSRF
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          validPasswordArbitrary(),
          async (name, email, password) => {
            await deleteUserByEmail(email);
            
            try {
              const tokenResponse = await request(app)
                .get('/api/auth/csrf-token')
                .expect('Content-Type', /json/);
              
              expect(tokenResponse.status).toBe(200);
              const csrfToken = tokenResponse.body.csrfToken;
              expect(csrfToken).toBeDefined();
              
              const cookies = tokenResponse.headers['set-cookie'];
              
              const registerResponse = await request(app)
                .post('/api/auth/register')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({ name, email, password })
                .expect('Content-Type', /json/);
              
              expect(registerResponse.status).toBe(201);
              expect(registerResponse.body.success).toBe(true);
              
              const user = await authService.getUserByEmail(email);
              expect(user).toBeDefined();
              expect(user.email).toBe(email);
              
            } finally {
              await deleteUserByEmail(email);
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 60000);
  });
});
