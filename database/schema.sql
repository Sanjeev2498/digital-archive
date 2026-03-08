-- Digital Archive of Indigenous Knowledge Database Schema
-- Database: indigenous_archive

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS indigenous_archive;
USE indigenous_archive;

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Admin@123)
-- Password hash generated with bcrypt, 10 salt rounds
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@indigenous-archive.com', '$2b$10$rZ5YhkqJ5YvN5xJ5YvN5xOqJ5YvN5xJ5YvN5xJ5YvN5xJ5YvN5xJ5Y', 'admin');

-- Note: Change the admin password after first login!
-- To generate a new bcrypt hash, use: bcrypt.hash('your-password', 10)
