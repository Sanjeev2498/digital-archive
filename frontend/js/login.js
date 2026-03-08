/**
 * Login Page Script
 * Handles login form submission and user authentication
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Check if already authenticated
  const authenticated = await AuthService.isAuthenticated();
  if (authenticated) {
    const user = AuthService.getCurrentUser();
    // Redirect based on role
    if (user && user.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/archive';
    }
    return;
  }

  // Handle form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear previous errors
    UIService.hideError();

    // Validate inputs
    if (!ValidationService.validateEmail(email)) {
      UIService.showError('Please enter a valid email address');
      emailInput.focus();
      return;
    }

    if (!ValidationService.validateRequired(password)) {
      UIService.showError('Please enter your password');
      passwordInput.focus();
      return;
    }

    // Show loading
    UIService.showLoading();

    try {
      // Attempt login
      const response = await AuthService.login(email, password);

      // Hide loading
      UIService.hideLoading();

      if (response.success) {
        // Check for redirect URL
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');

        // Redirect based on role or saved URL
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else if (response.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/archive';
        }
      } else {
        UIService.showError(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      UIService.hideLoading();
      // Display user-friendly error message
      UIService.showError(error.message || 'Login failed. Please try again.');
    }
  });

  // Add enter key support
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
      }
    });
  });
});
