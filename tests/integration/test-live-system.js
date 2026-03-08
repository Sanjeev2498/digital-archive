/**
 * Live System Test
 * Tests the running server with real API calls
 */

const baseUrl = 'http://localhost:3000';

async function testSystem() {
  console.log('🧪 Testing Live System...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣  Testing server connection...');
    const homeResponse = await fetch(`${baseUrl}/`);
    if (homeResponse.ok) {
      console.log('   ✓ Server is running\n');
    } else {
      throw new Error('Server not responding');
    }

    // Test 2: Test registration
    console.log('2️⃣  Testing user registration...');
    const testEmail = `test${Date.now()}@example.com`;
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: 'Test@123'
      })
    });
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok && registerData.success) {
      console.log('   ✓ Registration successful');
      console.log(`   User: ${registerData.user.name} (${registerData.user.email})\n`);
    } else {
      throw new Error(`Registration failed: ${registerData.message}`);
    }

    // Test 3: Test login
    console.log('3️⃣  Testing user login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: testEmail,
        password: 'Test@123'
      })
    });
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('   ✓ Login successful');
      console.log(`   User: ${loginData.user.name} (Role: ${loginData.user.role})\n`);
    } else {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    // Test 4: Test admin login
    console.log('4️⃣  Testing admin login...');
    const adminLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@indigenous.com',
        password: 'Admin@123'
      })
    });
    const adminLoginData = await adminLoginResponse.json();
    
    if (adminLoginResponse.ok && adminLoginData.success) {
      console.log('   ✓ Admin login successful');
      console.log(`   Admin: ${adminLoginData.user.name} (Role: ${adminLoginData.user.role})\n`);
    } else {
      throw new Error(`Admin login failed: ${adminLoginData.message}`);
    }

    // Test 5: Test duplicate email rejection
    console.log('5️⃣  Testing duplicate email rejection...');
    const duplicateResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: testEmail,
        password: 'Test@456'
      })
    });
    const duplicateData = await duplicateResponse.json();
    
    if (duplicateResponse.status === 409 && !duplicateData.success) {
      console.log('   ✓ Duplicate email properly rejected');
      console.log(`   Message: ${duplicateData.message}\n`);
    } else {
      throw new Error('Duplicate email was not rejected');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════\n');
    console.log('🎉 Your system is fully functional!\n');
    console.log('📝 Test Accounts Created:');
    console.log(`   Admin: admin@indigenous.com / Admin@123`);
    console.log(`   User:  ${testEmail} / Test@123\n`);
    console.log('🌐 Open in browser: http://localhost:3000\n');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Server is running (npm run dev)');
    console.log('2. MySQL is connected');
    console.log('3. Database is set up correctly\n');
  }
}

testSystem();
