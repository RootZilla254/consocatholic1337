// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-app-domain.com/api' 
    : 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Application Routes
export const ROUTES = {
  LOGIN: '/',
  ADMIN_DASHBOARD: '/admin-dashboard',
  TEACHER_DASHBOARD: '/teacher-dashboard',
  PARENT_DASHBOARD: '/parent-dashboard',
  STUDENT_DASHBOARD: '/student-dashboard',
  SCHOOL_EVENTS: '/school-events-memories'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  STUDENT: 'Student'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email for verification.',
  PASSWORD_RESET: 'Password reset email sent successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ATTENDANCE_MARKED: 'Attendance marked successfully.',
  ASSIGNMENT_SUBMITTED: 'Assignment submitted successfully.'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  SESSION_TOKEN: 'session_token',
  USER_DATA: 'user',
  THEME_PREFERENCE: 'theme',
  LANGUAGE_PREFERENCE: 'language'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  PASSWORD: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  },
  PHONE: {
    pattern: /^\+?[\d\s\-\(\)]{10,}$/,
    message: 'Please enter a valid phone number'
  },
  REQUIRED: {
    test: (value) => value && value.toString().trim() !== '',
    message: 'This field is required'
  }
};