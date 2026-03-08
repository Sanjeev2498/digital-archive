const bcrypt = require('bcrypt');
const { query, queryOne } = require('../db');

const SALT_ROUNDS = 10;

class AuthenticationService {
  /**
   * Register a new user
   * @param {string} name - User's full name
   * @param {string} email - User's email address
   * @param {string} password - User's plain text password
   * @returns {Promise<Object>} Created user object (without password)
   */
  async registerUser(name, email, password) {
    try {
      // Validate name
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Name is required and cannot be empty');
      }
      if (name.trim().length > 100) {
        throw new Error('Name must be less than 100 characters');
      }

      // Validate email
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        throw new Error('Email is required');
      }
      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Validate password
      if (!password || typeof password !== 'string') {
        throw new Error('Password is required');
      }
      if (password.trim().length === 0) {
        throw new Error('Password cannot be empty or whitespace only');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one number');
      }

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Insert user into database
      const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      const result = await query(sql, [name.trim(), email.trim(), hashedPassword, 'user']);

      // Return user without password
      return {
        id: result.insertId,
        name: name.trim(),
        email: email.trim(),
        role: 'user'
      };
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {string} email - User's email address
   * @param {string} password - User's plain text password
   * @returns {Promise<Object>} User object (without password) if valid
   */
  async loginUser(email, password) {
    try {
      // Get user by email
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Compare password
      const isValid = await this.comparePassword(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const user = await queryOne(sql, [id]);
      return user;
    } catch (error) {
      console.error('Get user by ID error:', error.message);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ?';
      const user = await queryOne(sql, [email]);
      return user;
    } catch (error) {
      console.error('Get user by email error:', error.message);
      throw error;
    }
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    try {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      return hash;
    } catch (error) {
      console.error('Password hashing error:', error.message);
      throw error;
    }
  }

  /**
   * Compare plain text password with hashed password
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if passwords match
   */
  async comparePassword(password, hash) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      console.error('Password comparison error:', error.message);
      throw error;
    }
  }
}

module.exports = new AuthenticationService();
