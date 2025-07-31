import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { apiService } from '../../../services/api';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { useToast } from '../../../hooks/useToast';
import ErrorHandler from '../../../services/errorHandler';

const AuthenticationCard = ({ onBiometricLogin, selectedRole, onRoleChange }) => {
  const navigate = useNavigate();
  const { executeWithErrorHandling } = useErrorHandler();
  const { success, error: showError } = useToast();
  const [authMode, setAuthMode] = useState('signin'); // 'signin', 'signup', 'register'
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    employeeId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const cardRef = useRef(null);

  // Mock credentials for different roles
  const mockCredentials = {
    Admin: { username: 'admin@skulicheck.edu', password: 'admin123' },
    Teacher: { username: 'teacher@skulicheck.edu', password: 'teacher123' },
    Parent: { username: 'parent@skulicheck.edu', password: 'parent123' },
    Student: { username: 'student@skulicheck.edu', password: 'student123' }
  };

  const roleOptions = [
    { value: '', label: 'Select your role', disabled: true },
    { value: 'Admin', label: 'Administrator', description: 'School management access' },
    { value: 'Teacher', label: 'Teacher', description: 'Classroom and student management' },
    { value: 'Parent', label: 'Parent', description: 'Child progress monitoring' },
    { value: 'Student', label: 'Student', description: 'Academic records and assignments' }
  ];

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const validationRules = {
      role: { required: true, message: 'Please select your role' },
      username: { required: true, type: 'email', message: 'Valid email is required' },
      password: { required: true, minLength: 6 }
    };

    if (authMode === 'signup' || authMode === 'register') {
      validationRules.fullName = { required: true };
      validationRules.confirmPassword = { 
        required: true,
        validate: (value, formData) => {
          if (value !== formData.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      };
      
      if (selectedRole === 'Teacher' || selectedRole === 'Admin') {
        validationRules.employeeId = { required: true };
      }
      
      if (selectedRole === 'Parent') {
        validationRules.phone = { required: true, type: 'phone' };
      }
    }

    const formData = { ...credentials, role: selectedRole };
    const validationErrors = ErrorHandler.handleFormValidation(formData, validationRules);
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (cardRef.current) {
        cardRef.current.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => (cardRef.current.style.animation = ''), 500);
      }
      return;
    }

    setIsLoading(true);
    await executeWithErrorHandling(async () => {
      if (authMode === 'signin') {
        const response = await apiService.login(credentials.username, credentials.password);
        
        const dashboardRoutes = {
          Admin: '/admin-dashboard',
          Teacher: '/teacher-dashboard',
          Parent: '/parent-dashboard',
          Student: '/student-dashboard'
        };

        success(`Welcome back, ${response.user.full_name}!`);
        navigate(dashboardRoutes[response.user.role] || dashboardRoutes[selectedRole]);
      } else {
        // Handle registration
        const registrationData = {
          email: credentials.username,
          password: credentials.password,
          full_name: credentials.fullName,
          role: selectedRole,
          phone: credentials.phone,
          employee_id: credentials.employeeId
        };
        
        await apiService.register(registrationData);
        success('Registration successful! Please check your email for verification.');
        setAuthMode('signin');
      }
    }, { action: 'authentication', mode: authMode, role: selectedRole });
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      setErrors({ role: 'Please select your role first' });
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const dashboardRoutes = {
      Admin: '/admin-dashboard',
      Teacher: '/teacher-dashboard',
      Parent: '/parent-dashboard',
      Student: '/student-dashboard'
    };
    navigate(dashboardRoutes[selectedRole]);
  };

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.classList.add('animate-fade-in');
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl p-8 card-elevation animate-fade-in"
    >
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Icon name="GraduationCap" size={32} color="white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Consolata Catholic Comprehensive School</h1>
        <p className="text-muted-foreground text-sm">Educational Management System</p>
      </div>

      {/* Auth Mode Toggle */}
      <div className="flex mb-6 p-1 bg-muted/10 rounded-lg">
        <button
          onClick={() => setAuthMode('signin')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            authMode === 'signin' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setAuthMode('signup')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            authMode === 'signup' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setAuthMode('register')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            authMode === 'register' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Register
        </button>
      </div>

      {/* Role Selection */}
      <div className="mb-6">
        <Select
          label="Select Role"
          options={roleOptions}
          value={selectedRole}
          onChange={onRoleChange}
          error={errors.role}
          required
          className="mb-4"
        />
      </div>

      {/* Google Sign-in */}
      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        loading={isLoading}
        iconName="Chrome"
        iconPosition="left"
        iconSize={18}
        className="w-full mb-4 focus-glow"
      >
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Credentials Form */}
      <div className="space-y-4 mb-6">
        {(authMode === 'signup' || authMode === 'register') && (
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={credentials.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            error={errors.fullName}
            required
            className="focus-glow"
          />
        )}

        <Input
          label="Username / Email"
          type="email"
          placeholder="Enter your username or email"
          value={credentials.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          error={errors.username}
          required
          className="focus-glow"
        />

        {(authMode === 'signup' || authMode === 'register') && (selectedRole === 'Teacher' || selectedRole === 'Admin') && (
          <Input
            label="Employee ID"
            type="text"
            placeholder="Enter your employee ID"
            value={credentials.employeeId}
            onChange={(e) => handleInputChange('employeeId', e.target.value)}
            error={errors.employeeId}
            required
            className="focus-glow"
          />
        )}

        {(authMode === 'signup' || authMode === 'register') && selectedRole === 'Parent' && (
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            value={credentials.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            required
            className="focus-glow"
          />
        )}

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            required
            className="focus-glow"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>

        {(authMode === 'signup' || authMode === 'register') && (
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={credentials.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              required
              className="focus-glow"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-muted-foreground">
              {authMode === 'signin' ? 'Remember me' : 'I agree to terms & conditions'}
            </span>
          </label>
          {authMode === 'signin' && (
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </button>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {errors.credentials && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-error text-sm flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-2" />
            {errors.credentials}
          </p>
        </div>
      )}
      {errors.success && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-success text-sm flex items-center">
            <Icon name="CheckCircle" size={16} className="mr-2" />
            {errors.success}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        variant="default"
        onClick={handleSubmit}
        disabled={isLoading}
        loading={isLoading}
        className="w-full mb-6 focus-glow"
      >
        {authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Sign Up' : 'Register Account'}
      </Button>

      {/* Biometric Options - Only show for Sign In */}
      {authMode === 'signin' && (
        <div className="border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Quick Access Options
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onBiometricLogin('fingerprint')}
              disabled={!selectedRole}
              className="w-12 h-12 bg-muted/10 hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Fingerprint Login"
            >
              <Icon name="Fingerprint" size={24} className="text-accent" />
            </button>
            <button
              onClick={() => onBiometricLogin('face')}
              disabled={!selectedRole}
              className="w-12 h-12 bg-muted/10 hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Face Recognition"
            >
              <Icon name="ScanFace" size={24} className="text-secondary" />
            </button>
          </div>
          {!selectedRole && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Please select your role first
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Secure access powered by SkuliCheck
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          © {new Date().getFullYear()} Educational Management System
        </p>
      </div>
    </div>
  );
};

export default AuthenticationCard;