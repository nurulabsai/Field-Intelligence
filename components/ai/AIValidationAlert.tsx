
import React from 'react';
import './AIValidationAlert.css';

export interface ValidationAlert {
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestedAction?: string;
  field?: string;
}

interface AIValidationAlertProps {
  alert: ValidationAlert;
  onDismiss: () => void;
}

export const AIValidationAlert: React.FC<AIValidationAlertProps> = ({
  alert,
  onDismiss,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return '💡';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`ai-validation-alert alert-${alert.type} animate-in slide-in-from-bottom-4`}>
      <div className="alert-icon">{getIcon(alert.type)}</div>
      
      <div className="alert-content">
        <p className="alert-message">{alert.message}</p>
        
        {alert.suggestedAction && (
          <div className="alert-action">
            <strong>Suggestion:</strong> {alert.suggestedAction}
          </div>
        )}
      </div>

      <button className="alert-dismiss" onClick={onDismiss}>
        ✕
      </button>
    </div>
  );
};
