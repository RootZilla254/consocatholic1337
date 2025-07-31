
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import ErrorHandler from './errorHandler';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('session_token');
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }

      if (!response.ok) {
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            this.logout(); // Clear invalid session
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
          case 403:
            throw new Error('Access denied. You do not have permission to perform this action.');
          case 404:
            throw new Error('The requested resource was not found.');
          case 429:
            throw new Error('Too many requests. Please wait a moment and try again.');
          case 500:
            throw new Error(ERROR_MESSAGES.SERVER_ERROR);
          default:
            throw new Error(data.error || ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      }

      return data;
    } catch (error) {
      // Handle AbortError (timeout)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }

      // Handle network errors with retry logic
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        if (retryCount < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
          return this.request(endpoint, options, retryCount + 1);
        }
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      throw error;
    }
  }

  // Authentication
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(userId, code) {
    return this.request('/verify-email', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, code }),
    });
  }

  async login(email, password) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.session_token) {
      localStorage.setItem('session_token', response.session_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.token = response.session_token;
    }

    return response;
  }

  async sendMFACode(email, method = 'email') {
    return this.request('/send-mfa-code', {
      method: 'POST',
      body: JSON.stringify({ email, method }),
    });
  }

  async verifyMFA(email, code, method = 'email') {
    return this.request('/verify-mfa', {
      method: 'POST',
      body: JSON.stringify({ email, code, method }),
    });
  }

  async resetPassword(email) {
    return this.request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout() {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    this.token = null;
  }

  // Utility methods
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.token && !!this.getStoredUser();
  }
}

export default new ApiService();
