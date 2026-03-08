/**
 * Register Page Script
 * Handles registration form submission and validation
 */

document.addEventListener('DOMContentLoaded', async () => {
  const registerForm = document.getElementById('register-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  // Check if already authenticated
  const authenticated = await AuthService.isAuthenticated();
  if (authenticated) {
    window.location.href = '/archive';
    return;
  }

  // Handle form submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Clear previous messages
    UIService.hideError();
    UIService.hideSuccess();

    // Validate name
    if (!ValidationService.validateRequired(name)) {
      UIService.showError('Please enter your full name');
      nameInput.focus();
      return;
    }

    if (!ValidationService.validateName(name)) {
      UIService.showError('Name can only contain letters, spaces, hyphens, and apostrophes');
      nameInput.focus();
      return;
    }

    // Validate email
    if (!ValidationService.validateEmail(email)) {
      UIService.showError('Please enter a valid email address');
      emailInput.focus();
      return;
    }

    // Validate password
    const passwordValidation = ValidationService.validatePassword(password);
    if (!passwordValidation.valid) {
      UIService.showError(passwordValidation.errors.join('. '));
      passwordInput.focus();
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      UIService.showError('Passwords do not match');
      confirmPasswordInput.focus();
      return;
    }

    // Show loading
    UIService.showLoading();

    try {
      // Attempt registration
      const response = await AuthService.register(name, email, password);

      // Hide loading
      UIService.hideLoading();

      if (response.success) {
        // Show success message
        UIService.showSuccess('Registration successful! Redirecting to login...');
        
        // Clear form
        registerForm.reset();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        UIService.showError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      UIService.hideLoading();
      
      // Display user-friendly error message
      UIService.showError(error.message || 'Registration failed. Please try again.');
    }
  });

  // Real-time password validation feedback
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    if (password.length > 0) {
      const validation = ValidationService.validatePassword(password);
      if (!validation.valid) {
        passwordInput.style.borderColor = 'var(--error)';
      } else {
        passwordInput.style.borderColor = 'var(--success)';
      }
    } else {
      passwordInput.style.borderColor = '';
    }
  });

  // Real-time confirm password validation
  confirmPasswordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length > 0) {
      if (password === confirmPassword) {
        confirmPasswordInput.style.borderColor = 'var(--success)';
      } else {
        confirmPasswordInput.style.borderColor = 'var(--error)';
      }
    } else {
      confirmPasswordInput.style.borderColor = '';
    }
  });
});
