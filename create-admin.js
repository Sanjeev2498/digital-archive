/**
 * Create Admin User Script
 * Uses the backend authentication service to create an admin user
 */

const authService = require('./backend/services/auth.service');
const { query } = require('./backend/db');

async function createAdmin() {
  try {
    console.log('Creating admin user...\n');

    // Check if admin already exists
    const existing = await authService.getUserByEmail('admin@indigenous.com');
    if (existing) {
      console.log('Admin user already exists!');
      console.log('Email: admin@indigenous.com');
      console.log('Password: Admin@123\n');
      return;
    }

    // Create admin user
    const admin = await authService.registerUser(
      'Admin User',
      'admin@indigenous.com',
      'Admin@123'
    );

    // Update role to admin
    await query('UPDATE users SET role = ? WHERE id = ?', ['admin', admin.id]);

    console.log('✅ Admin user created successfully!\n');
    console.log('Email: admin@indigenous.com');
    console.log('Password: Admin@123\n');
    console.log('You can now login at: http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
