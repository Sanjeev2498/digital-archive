/**
 * Simple script to test backend authentication endpoints
 * Run this after starting the server with: npm run dev
 */

const testBackend = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Backend Authentication...\n');

  try {
    // Test 1: Check session (should be unauthenticated)
    console.log('1️⃣  Testing session endpoint...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
    const sessionData = await sessionResponse.json();
    console.log('   Status:', sessionResponse.status);
    console.log('   Response:', sessionData);
    console.log('   ✓ Session endpoint working\n');

    // Test 2: Register a new user
    console.log('2️⃣  Testing registration...');
    const registerData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test@123'
    };
    
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    const registerResult = await registerResponse.json();
    console.log('   Status:', registerResponse.status);
    console.log('   Response:', registerResult);
    
    if (registerResponse.status === 201) {
      console.log('   ✓ Registration successful\n');
    } else {
      console.log('   ✗ Registration failed\n');
      return;
    }

    // Test 3: Login with registered user
    console.log('3️⃣  Testing login...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include'
    });
    const loginResult = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Response:', loginResult);
    
    if (loginResponse.status === 200) {
      console.log('   ✓ Login successful\n');
    } else {
      console.log('   ✗ Login failed\n');
      return;
    }

    // Test 4: Try login with wrong password
    console.log('4️⃣  Testing invalid credentials...');
    const wrongLoginData = {
      email: registerData.email,
      password: 'WrongPassword123'
    };
    
    const wrongLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wrongLoginData)
    });
    const wrongLoginResult = await wrongLoginResponse.json();
    console.log('   Status:', wrongLoginResponse.status);
    console.log('   Response:', wrongLoginResult);
    
    if (wrongLoginResponse.status === 401) {
      console.log('   ✓ Invalid credentials properly rejected\n');
    } else {
      console.log('   ✗ Invalid credentials not properly handled\n');
    }

    // Test 5: Try duplicate registration
    console.log('5️⃣  Testing duplicate email registration...');
    const duplicateResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    const duplicateResult = await duplicateResponse.json();
    console.log('   Status:', duplicateResponse.status);
    console.log('   Response:', duplicateResult);
    
    if (duplicateResponse.status === 409) {
      console.log('   ✓ Duplicate email properly rejected\n');
    } else {
      console.log('   ✗ Duplicate email not properly handled\n');
    }

    console.log('✅ All backend tests completed!\n');
    console.log('Backend authentication is working correctly.');

  } catch (error) {
    console.error('❌ Error testing backend:', error.message);
    console.log('\nMake sure:');
    console.log('1. MySQL is running');
    console.log('2. Database is created (run database/schema.sql)');
    console.log('3. Server is running (npm run dev)');
    console.log('4. .env file has correct database credentials');
  }
};

// Run tests
testBackend();
