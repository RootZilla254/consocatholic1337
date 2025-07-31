import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ErrorAlert = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false,
  className = '' 
}) => {
  if (!error) return null;

  const getErrorIcon = (type) => {
    switch (type) {
      case 'network':
        return 'WifiOff';
      case 'server':
        return 'Server';
      case 'auth':
        return 'Lock';
      case 'validation':
        return 'AlertCircle';
      default:
        return 'AlertTriangle';
    }
  };

  const getErrorColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-error/10 border-error/20 text-error';
      case 'medium':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'low':
        return 'bg-muted/10 border-muted/20 text-muted-foreground';
      default:
        return 'bg-error/10 border-error/20 text-error';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getErrorColor(error.severity)} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon name={getErrorIcon(error.type)} size={20} className="flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm mb-1">
            {error.type === 'network' ? 'Connection Error' :
             error.type === 'server' ? 'Server Error' :
             error.type === 'auth' ? 'Authentication Error' :
             error.type === 'validation' ? 'Validation Error' :
             'Error'}
          </h3>
          <p className="text-sm opacity-90">{error.message}</p>
          
          {showDetails && error.details && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer hover:opacity-80">
                Show technical details
              </summary>
              <pre className="mt-2 text-xs bg-background/20 p-2 rounded overflow-auto">
                {error.details}
              </pre>
            </details>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onRetry && error.isRetryable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={14}
              className="text-xs"
            >
              Retry
            </Button>
          )}
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="w-6 h-6"
            >
              <Icon name="X" size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;