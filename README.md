# Digital Archive of Indigenous Knowledge

A web application to digitally preserve and provide access to indigenous knowledge including traditional medicine, agriculture, cultural practices, and folk heritage. The system uses a hybrid architecture combining client-side content management with server-side authentication for optimal performance and security.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure registration and login with bcrypt password hashing
- **Role-Based Access Control**: Separate permissions for regular users and administrators
- **Archive Content Display**: Browse indigenous knowledge with search and category filtering
- **Admin Dashboard**: Full CRUD operations for managing archive content
- **Responsive Design**: Mobile-first approach supporting all device sizes
- **Hybrid Storage**: Client-side content storage (localStorage/JSON) with server-side user management (MySQL)
- **Security**: Input validation, XSS protection, CSRF protection, rate limiting, and SQL injection prevention

## Tech Stack

### Frontend
- **HTML5**: Semantic markup for accessibility
- **CSS3**: Flexbox and Grid for responsive layouts
- **Vanilla JavaScript (ES6+)**: No frameworks, pure JavaScript modules

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **MySQL**: Relational database for user management
- **bcrypt**: Password hashing
- **express-session**: Session management
- **validator**: Input validation and sanitization

### Testing
- **Jest**: Unit and integration testing
- **fast-check**: Property-based testing
- **Supertest**: HTTP assertion testing

## Prerequisites

Before installing, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v14.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - npm comes bundled with Node.js

2. **MySQL** (v8.0 or higher)
   - **Option A**: MySQL Community Server
     - Download from: https://dev.mysql.com/downloads/mysql/
     - Remember your root password during installation
   - **Option B**: XAMPP (easier for beginners)
     - Download from: https://www.apachefriends.org/
     - Includes MySQL, phpMyAdmin, and Apache

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 500MB free space
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## Installation

Follow these steps to set up the application:

### Step 1: Clone or Download the Repository

```bash
# Using Git
git clone https://github.com/Sanjeev2498/digital-archive.git
cd digital-archive

# Or download and extract the ZIP file
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`:
- express, mysql2, bcrypt, express-session, cors, dotenv, validator
- csrf-csrf, express-rate-limit, cookie-parser
- jest, fast-check, supertest, nodemon (dev dependencies)

### Step 3: Set Up MySQL Database

#### Option A: Using Command Line

```bash
# Start MySQL service (Windows)
net start MySQL80

# Start MySQL service (macOS/Linux)
sudo systemctl start mysql

# Login to MySQL
mysql -u root -p

# Create database and run schema
CREATE DATABASE IF NOT EXISTS indigenous_archive;
USE indigenous_archive;
SOURCE database/schema.sql;
exit;
```

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Click **File → Open SQL Script**
4. Select `database/schema.sql` from the project directory
5. Click the lightning bolt icon to execute

#### Option C: Using phpMyAdmin (XAMPP users)

1. Start XAMPP and ensure MySQL is running
2. Open browser and navigate to: `http://localhost/phpmyadmin`
3. Click **New** to create a database
4. Name it: `indigenous_archive`
5. Click the **SQL** tab
6. Copy and paste the contents of `database/schema.sql`
7. Click **Go** to execute

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor and update the values (see [Environment Configuration](#environment-configuration) section)

### Step 5: Verify Installation

```bash
# Test database connection
npm run test:backend

# You should see: "✓ Database connected successfully"
```

## Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the project root with the following settings:

### Server Configuration

```env
# Port for the Express server
PORT=3000

# Environment mode (development, production, test)
NODE_ENV=development
```

### Database Configuration

```env
# MySQL connection settings
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=indigenous_archive
DB_PORT=3306
```

**Important Notes:**
- If using XAMPP, leave `DB_PASSWORD` empty (no password)
- If you set a root password during MySQL installation, use that password
- Change `DB_USER` if you created a specific MySQL user for this application

### Session Configuration

```env
# Secret key for session encryption (change in production!)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Session expiration time in milliseconds (default: 24 hours)
SESSION_MAX_AGE=86400000
```

**Security Warning:** Always use a strong, random SESSION_SECRET in production. Generate one using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CSRF Protection

```env
# Secret key for CSRF token generation
CSRF_SECRET=your-csrf-secret-key-change-this-in-production
```

### CORS Configuration

```env
# Allowed origin for CORS (frontend URL)
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

This starts the server with nodemon, which automatically restarts when you make code changes.

### Production Mode

```bash
npm start
```

This starts the server without auto-reload for production environments.

### Expected Output

When the server starts successfully, you should see:

```
✓ Database connected successfully
╔════════════════════════════════════════════════════════════╗
║  Digital Archive of Indigenous Knowledge                   ║
║  Server running on http://localhost:3000                   ║
║  Environment: development                                  ║
╚════════════════════════════════════════════════════════════╝
```

### Accessing the Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You'll see the landing page with options to login or register

## Project Structure

```
indigenous-knowledge-archive/
│
├── frontend/                          # Frontend application files
│   ├── index.html                    # Landing page with project overview
│   ├── login.html                    # User login page
│   ├── register.html                 # User registration page
│   ├── archive.html                  # Archive content display (authenticated)
│   ├── admin.html                    # Admin dashboard (admin only)
│   ├── style.css                     # Global styles and responsive design
│   │
│   ├── js/                           # JavaScript modules
│   │   ├── auth.js                   # Authentication service (login, register, logout)
│   │   ├── validation.js             # Input validation utilities
│   │   ├── ui.js                     # UI helper functions (messages, loading states)
│   │   ├── archive.js                # Archive content management service
│   │   ├── login.js                  # Login page controller
│   │   ├── register.js               # Registration page controller
│   │   ├── archive-page.js           # Archive page controller (search, filter)
│   │   └── admin-page.js             # Admin dashboard controller (CRUD operations)
│   │
│   └── data/                         # Default archive content
│       └── default-archive.json      # Sample indigenous knowledge data
│
├── backend/                          # Backend application files
│   ├── server.js                     # Main Express server and configuration
│   ├── db.js                         # MySQL database connection pool
│   │
│   ├── routes/                       # API route definitions
│   │   └── auth.routes.js            # Authentication endpoints
│   │
│   ├── services/                     # Business logic layer
│   │   └── auth.service.js           # Authentication service (register, login, password hashing)
│   │
│   └── middleware/                   # Express middleware
│       ├── auth.middleware.js        # Authentication and authorization checks
│       ├── validation.middleware.js  # Input validation and sanitization
│       ├── csrf.middleware.js        # CSRF protection
│       └── rate-limit.middleware.js  # Rate limiting for API endpoints
│
├── database/                         # Database files
│   └── schema.sql                    # MySQL database schema (users table)
│
├── tests/                            # Test suites
│   ├── unit/                         # Unit tests for specific functions
│   ├── property/                     # Property-based tests (fast-check)
│   └── integration/                  # Integration tests (API endpoints)
│
├── .env                              # Environment variables (not in git)
├── .env.example                      # Example environment configuration
├── .gitignore                        # Git ignore rules
├── package.json                      # Node.js dependencies and scripts
├── package-lock.json                 # Locked dependency versions
├── jest.config.js                    # Jest testing configuration
├── README.md                         # This file
└── ACCESSIBILITY_CHECKLIST.md        # Accessibility compliance checklist
```

### Key Directories Explained

- **frontend/**: All client-side code served statically by Express
- **backend/**: Server-side Node.js/Express application
- **database/**: SQL schema and database-related files
- **tests/**: Comprehensive test suite with unit, property, and integration tests

## Usage Guide

### For Regular Users

1. **Register an Account**
   - Navigate to the registration page
   - Fill in your name, email, and password
   - Password must be at least 8 characters with uppercase, lowercase, and number
   - Click "Register"

2. **Login**
   - Enter your email and password
   - Click "Login"
   - You'll be redirected to the archive page

3. **Browse Archive Content**
   - View all indigenous knowledge items
   - Use the search bar to find specific content
   - Filter by category (medicine, agriculture, cultural, heritage, crafts)
   - Click on items to view full details

4. **Logout**
   - Click the "Logout" button in the navigation

### For Administrators

1. **Login with Admin Account**
   - Default admin credentials:
     - Email: `admin@indigenous-archive.com`
     - Password: `Admin@123`
   - **⚠️ Change this password immediately after first login!**

2. **Access Admin Dashboard**
   - After login, you'll be redirected to the admin dashboard
   - View all archive content in a management table

3. **Add New Content**
   - Click "Add New Content" button
   - Fill in the form (title, category, description, content, tags)
   - Click "Save"

4. **Edit Content**
   - Click the "Edit" button on any content item
   - Modify the fields in the modal form
   - Click "Save"

5. **Delete Content**
   - Click the "Delete" button on any content item
   - Confirm the deletion
   - Content will be removed immediately

## API Documentation

### Authentication Endpoints

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Logout User

```http
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Check Session Status

```http
GET /api/auth/session
```

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false,
  "message": "Not authenticated"
}
```

## Testing

The application includes comprehensive test coverage with unit tests, property-based tests, and integration tests.

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run property-based tests only
npm run test:property

# Run with coverage report
npm run test:coverage

# Run in watch mode (auto-rerun on changes)
npm run test:watch

# Run backend connection test
npm run test:backend
```

### Test Structure

- **Unit Tests** (`tests/unit/`): Test specific functions and components
- **Property Tests** (`tests/property/`): Test universal properties across many inputs using fast-check
- **Integration Tests** (`tests/integration/`): Test complete API flows and interactions

### Property-Based Testing

The application uses property-based testing to verify correctness properties:
- User registration creates valid database records
- Email uniqueness is enforced
- Invalid data is rejected appropriately
- Authentication flow maintains integrity
- Search and filter operations are accurate
- Role-based access control works correctly

## Security Features

### Password Security
- **Bcrypt Hashing**: All passwords hashed with 10 salt rounds
- **No Plaintext Storage**: Passwords never stored in plaintext
- **Strength Requirements**: Minimum 8 characters with mixed case and numbers

### Authentication & Authorization
- **Session-Based Auth**: Secure server-side session management
- **Role-Based Access**: Separate permissions for users and admins
- **Session Expiration**: Configurable session timeout (default 24 hours)

### Input Protection
- **Validation**: All inputs validated on both client and server
- **Sanitization**: HTML and SQL injection prevention
- **XSS Protection**: Input escaping and Content Security Policy

### API Security
- **CSRF Protection**: Token-based CSRF prevention
- **Rate Limiting**: Prevents brute force attacks on authentication endpoints
- **CORS Configuration**: Controlled cross-origin access
- **Parameterized Queries**: SQL injection prevention

### Error Handling
- **Generic Error Messages**: Prevents user enumeration
- **Secure Logging**: Sensitive data not logged
- **Graceful Failures**: User-friendly error messages

## Troubleshooting

### Database Connection Issues

**Problem**: "Database connection failed"

**Solutions:**
1. Verify MySQL service is running:
   ```bash
   # Windows
   net start MySQL80
   
   # macOS/Linux
   sudo systemctl status mysql
   ```

2. Check credentials in `.env` file match your MySQL setup

3. Verify database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

4. Check MySQL error logs for details

### Port Already in Use

**Problem**: "Port 3000 already in use"

**Solutions:**
1. Change PORT in `.env` file to another port (e.g., 3001)
2. Or stop the process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill
   ```

### Module Not Found Errors

**Problem**: "Cannot find module"

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Ensure you're in the project root directory

3. Check Node.js version: `node --version` (should be v14+)

### Session/Login Issues

**Problem**: Can't stay logged in or session expires immediately

**Solutions:**
1. Check SESSION_SECRET is set in `.env`
2. Clear browser cookies and try again
3. Verify session middleware is configured in `backend/server.js`

### Frontend Not Loading

**Problem**: Blank page or 404 errors

**Solutions:**
1. Ensure server is running (`npm run dev`)
2. Check browser console for JavaScript errors
3. Verify you're accessing `http://localhost:3000` (not file://)
4. Clear browser cache

### MySQL Service Won't Start

**Problem**: MySQL service fails to start

**Solutions:**
1. Check if port 3306 is already in use
2. Review MySQL error logs
3. Consider using XAMPP as an alternative

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Code Style**: Follow existing code conventions
2. **Testing**: Add tests for new features
3. **Documentation**: Update README for significant changes
4. **Commits**: Use clear, descriptive commit messages
5. **Pull Requests**: Describe changes and link related issues

## License

ISC

---

**The Ancient Knowledge** - Preserving indigenous wisdom for future generations.
