import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  action = null,
  persistent = false 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-center justify-between p-4 rounded-lg border shadow-lg backdrop-blur-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-success/10 border-success/20 text-success`;
      case 'error':
        return `${baseStyles} bg-error/10 border-error/20 text-error`;
      case 'warning':
        return `${baseStyles} bg-warning/10 border-warning/20 text-warning`;
      case 'info':
      default:
        return `${baseStyles} bg-primary/10 border-primary/20 text-primary`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
      default:
        return 'Info';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`transition-all duration-300 ${
      isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className={getToastStyles()}>
        <div className="flex items-center space-x-3">
          <Icon name={getIcon()} size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
            {action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className="mt-2 text-xs"
              >
                {action.label}
              </Button>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="ml-2 flex-shrink-0 w-6 h-6"
        >
          <Icon name="X" size={14} />
        </Button>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [], onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;