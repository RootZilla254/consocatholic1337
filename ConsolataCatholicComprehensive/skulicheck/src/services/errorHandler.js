class ErrorHandler {
  static handleApiError(error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: 'Unable to connect to server. Please check your internet connection.',
        type: 'network',
        severity: 'high'
      };
    }

    // Server errors
    if (error.message.includes('500')) {
      return {
        message: 'Server error. Please try again later.',
        type: 'server',
        severity: 'high'
      };
    }

    // Authentication errors
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return {
        message: 'Your session has expired. Please log in again.',
        type: 'auth',
        severity: 'medium'
      };
    }

    // Validation errors
    if (error.message.includes('400') || error.message.includes('validation')) {
      return {
        message: error.message || 'Please check your input and try again.',
        type: 'validation',
        severity: 'low'
      };
    }

    // Default error
    return {
      message: error.message || 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      severity: 'medium'
    };
  }

  static handleFormValidation(formData, rules) {
    const errors = {};

    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = formData[field];

      // Required field validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = rule.message || `${field} is required`;
        return;
      }

      // Skip other validations if field is empty and not required
      if (!value) return;

      // Email validation
      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field] = 'Please enter a valid email address';
        }
      }

      // Password validation
      if (rule.type === 'password') {
        if (value.length < (rule.minLength || 6)) {
          errors[field] = `Password must be at least ${rule.minLength || 6} characters`;
        }
        if (rule.requireUppercase && !/[A-Z]/.test(value)) {
          errors[field] = 'Password must contain at least one uppercase letter';
        }
        if (rule.requireLowercase && !/[a-z]/.test(value)) {
          errors[field] = 'Password must contain at least one lowercase letter';
        }
        if (rule.requireNumber && !/\d/.test(value)) {
          errors[field] = 'Password must contain at least one number';
        }
      }

      // Phone validation
      if (rule.type === 'phone') {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
          errors[field] = 'Please enter a valid phone number';
        }
      }

      // Custom validation function
      if (rule.validate && typeof rule.validate === 'function') {
        const customError = rule.validate(value, formData);
        if (customError) {
          errors[field] = customError;
        }
      }
    });

    return errors;
  }

  static logError(error, context = {}) {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // In production, you would send this to your error tracking service
    // Example: Sentry, LogRocket, etc.
    
    return errorLog;
  }

  static createRetryableError(originalError, retryFunction, maxRetries = 3) {
    return {
      ...originalError,
      retry: retryFunction,
      maxRetries,
      isRetryable: true
    };
  }
}

export default ErrorHandler;