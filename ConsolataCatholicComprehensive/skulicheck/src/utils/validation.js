export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  password: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  },
  
  phone: {
    pattern: /^\+?[\d\s\-\(\)]{10,}$/,
    message: 'Please enter a valid phone number'
  },
  
  required: {
    test: (value) => value && value.toString().trim() !== '',
    message: 'This field is required'
  }
};

export const validateField = (value, rules) => {
  if (!rules) return null;

  // Check required
  if (rules.required && !ValidationRules.required.test(value)) {
    return rules.message || ValidationRules.required.message;
  }

  // Skip other validations if field is empty and not required
  if (!value) return null;

  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message;
  }

  // Check min length
  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  // Check max length
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  // Custom validation
  if (rules.validate && typeof rules.validate === 'function') {
    return rules.validate(value);
  }

  return null;
};

export const validateForm = (formData, validationSchema) => {
  const errors = {};

  Object.keys(validationSchema).forEach(field => {
    const fieldRules = validationSchema[field];
    const fieldValue = formData[field];
    const error = validateField(fieldValue, fieldRules);
    
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};