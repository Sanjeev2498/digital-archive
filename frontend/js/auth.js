/**
 * Authentication Module
 * Handles user authentication, session management, and API calls
 */

const AuthService = {
  API_BASE_URL: '/api/auth',
  csrfToken: null,

  /**
   * Get CSRF token from server
   * @returns {Promise<string>} CSRF token
   */
  async getCsrfToken() {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/csrf-token`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
        return this.csrfToken;
      }
    } catch (error) {
      console.error('Error getting CSRF token:', error);
    }

    return null;
  },

  /**
   * Make authenticated API request with CSRF token
   * @param {string} url - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async authenticatedFetch(url, options = {}) {
    const token = await this.getCsrfToken();
    
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };

    if (token && options.method && options.method !== 'GET') {
      headers['X-CSRF-Token'] = token;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });

      // Check for session expiration (401 Unauthorized)
      if (response.status === 401) {
        // Clear session and redirect to login
        sessionStorage.removeItem('user');
        this.csrfToken = null;
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }

      return response;
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {string} name - User's full name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response data
   */
  async register(name, email, password) {
    try {
      const response = await this.authenticatedFetch(`${this.API_BASE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      // Re-throw with user-friendly message
      if (error.message.includes('Network error')) {
        throw error;
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response data with user info
   */
  async login(email, password) {
    try {
      const response = await this.authenticatedFetch(`${this.API_BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data in sessionStorage
      if (data.user) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw with user-friendly message
      if (error.message.includes('Network error')) {
        throw error;
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Response data
   */
  async logout() {
    try {
      const response = await this.authenticatedFetch(`${this.API_BASE_URL}/logout`, {
        method: 'POST'
      });

      const data = await response.json();

      // Clear session storage and CSRF token
      sessionStorage.removeItem('user');
      this.csrfToken = null;

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear session storage even if API call fails
      sessionStorage.removeItem('user');
      this.csrfToken = null;
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} True if authenticated
   */
  async isAuthenticated() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/session`, {
        credentials: 'include'
      });

      if (response.status === 401) {
        // Session expired
        sessionStorage.removeItem('user');
        return false;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          // Update sessionStorage with latest user data
          sessionStorage.setItem('user', JSON.stringify(data.user));
          return true;
        }
      }

      // Clear invalid session data
      sessionStorage.removeItem('user');
      return false;
    } catch (error) {
      console.error('Session check error:', error);
      // On network error, check if we have cached user data
      const cachedUser = sessionStorage.getItem('user');
      if (cachedUser) {
        // Allow temporary offline access with cached data
        return true;
      }
      sessionStorage.removeItem('user');
      return false;
    }
  },

  /**
   * Get current user from session storage
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    try {
      const userStr = sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Check if current user is admin
   * @returns {boolean} True if user is admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  /**
   * Redirect to login if not authenticated
   * @param {string} redirectUrl - URL to redirect to after login
   */
  async requireAuth(redirectUrl = '/login') {
    const authenticated = await this.isAuthenticated();
    if (!authenticated) {
      // Store current page for redirect after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  /**
   * Redirect to archive if not admin
   */
  async requireAdmin() {
    const authenticated = await this.requireAuth();
    if (!authenticated) return false;

    if (!this.isAdmin()) {
      window.location.href = '/archive';
      return false;
    }
    return true;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
}
