-- Digital Archive of Indigenous Knowledge Database Schema
CREATE DATABASE IF NOT EXISTS indigenous_archive;
USE indigenous_archive;

DROP TABLE IF EXISTS archive_content;
DROP TABLE IF EXISTS users;

-- Users table
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

-- Archive content table
CREATE TABLE archive_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  category ENUM('medicine', 'agriculture', 'cultural', 'heritage', 'crafts') NOT NULL,
  description VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags VARCHAR(500) DEFAULT '',
  author_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
