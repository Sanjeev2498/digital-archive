/**
 * Manual test script for rate limiting
 * Run with: node test-rate-limit.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let csrfToken = null;
let cookies = [];

async function makeRequest(path, method = 'POST', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add CSRF token if available
    if (csrfToken) {
      options.headers['x-csrf-token'] = csrfToken;
    }

    // Add cookies if available
    if (cookies.length > 0) {
      options.headers['Cookie'] = cookies.join('; ');
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      // Capture cookies
      const setCookies = res.headers['set-cookie'];
      if (setCookies) {
        setCookies.forEach(cookie => {
          const cookieName = cookie.split('=')[0];
          // Remove old cookie with same name
          cookies = cookies.filter(c => !c.startsWith(cookieName + '='));
          // Add new cookie (keep full cookie string before first semicolon)
          cookies.push(cookie.split(';')[0]);
        });
      }
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers,
            cookies: setCookies
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers,
            cookies: setCookies
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function getCsrfToken() {
  console.log('Getting CSRF token...');
  const response = await makeRequest('/api/auth/csrf-token', 'GET');
  console.log('Response set-cookie headers:', response.cookies);
  console.log('All cookies captured:', cookies);
  if (response.body.csrfToken) {
    csrfToken = response.body.csrfToken;
    console.log('✓ CSRF token obtained');
    return true;
  }
  console.log('❌ Failed to get CSRF token');
  return false;
}

async function testLoginRateLimit() {
  console.log('\n=== Testing Login Rate Limiting (5 attempts/15min) ===');
  
  for (let i = 1; i <= 7; i++) {
    const response = await makeRequest('/api/auth/login', 'POST', {
      email: `test${Date.now()}${i}@example.com`,
      password: 'Password123'
    });
    
    const statusMsg = response.status === 429 ? 'RATE LIMITED' : 
                      response.status === 401 ? 'AUTH FAILED' :
                      response.status === 403 ? 'CSRF FAILED' : 'OK';
    
    console.log(`Attempt ${i}: Status ${response.status} (${statusMsg})`);
    
    if (i <= 5 && response.status === 429) {
      console.log('❌ FAIL: Should not be rate limited yet');
    } else if (i > 5 && response.status !== 429) {
      console.log(`❌ FAIL: Should be rate limited (got ${response.status})`);
    } else if (i > 5 && response.status === 429) {
      console.log('✓ PASS: Rate limit working correctly');
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function testRegistrationRateLimit() {
  console.log('\n=== Testing Registration Rate Limiting (3 attempts/hour) ===');
  
  for (let i = 1; i <= 5; i++) {
    const response = await makeRequest('/api/auth/register', 'POST', {
      name: `Test User ${i}`,
      email: `newuser${Date.now()}${i}@example.com`,
      password: 'Password123'
    });
    
    console.log(`Attempt ${i}: Status ${response.status} - ${response.body.message || 'OK'}`);
    
    if (i <= 3 && response.status === 429) {
      console.log('❌ FAIL: Should not be rate limited yet');
    } else if (i > 3 && response.status !== 429) {
      console.log('❌ FAIL: Should be rate limited');
    } else if (i > 3 && response.status === 429) {
      console.log('✓ PASS: Rate limit working correctly');
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function runTests() {
  console.log('Starting Rate Limit Tests...');
  console.log('Make sure the server is running on http://localhost:3000');
  console.log('Run: npm start (in another terminal)\n');
  
  try {
    // Get CSRF token first
    const hasToken = await getCsrfToken();
    if (!hasToken) {
      console.log('Cannot proceed without CSRF token');
      return;
    }
    
    await testLoginRateLimit();
    await testRegistrationRateLimit();
    console.log('\n=== Tests Complete ===');
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
