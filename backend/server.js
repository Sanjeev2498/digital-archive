const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./db');
const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const { csrfTokenGenerator, csrfProtection, csrfErrorHandler } = require('./middleware/csrf.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'indigenous-archive-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000 // 24 hours
  }
}));

// Cookie parser - required for csrf-csrf
app.use(cookieParser());

// CSRF Protection - Generate tokens for all requests
app.use(csrfTokenGenerator);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes - CSRF token endpoint is unprotected, other routes are protected
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/archive', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/archive.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// CSRF error handler (must be before global error handler)
app.use(csrfErrorHandler);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'An error occurred' 
    : error.message;
  
  res.status(error.status || 500).json({
    success: false,
    message: message
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed. Server will run in frontend-only mode.');
      console.warn('⚠️  API endpoints will not work until database is connected.');
    }

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  Digital Archive of Indigenous Knowledge                   ║
║  Server running on http://localhost:${PORT}                   ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  Database: ${dbConnected ? 'Connected ✓' : 'Not Connected ✗'}                      ║
╚════════════════════════════════════════════════════════════╝

📄 View the pages:
   → Home:     http://localhost:${PORT}/
   → Login:    http://localhost:${PORT}/login
   → Register: http://localhost:${PORT}/register
   → Archive:  http://localhost:${PORT}/archive
   → Admin:    http://localhost:${PORT}/admin
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
