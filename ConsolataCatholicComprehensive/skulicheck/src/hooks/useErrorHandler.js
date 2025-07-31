import { useState, useCallback } from 'react';
import ErrorHandler from '../services/errorHandler';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, context = {}) => {
    const processedError = ErrorHandler.handleApiError(error);
    ErrorHandler.logError(error, context);
    setError(processedError);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async (asyncFunction, context = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFunction();
      setIsLoading(false);
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError]);

  const retryOperation = useCallback(async (operation, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await executeWithErrorHandling(operation, { attempt, maxRetries });
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError;
  }, [executeWithErrorHandling]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
    retryOperation
  };
};