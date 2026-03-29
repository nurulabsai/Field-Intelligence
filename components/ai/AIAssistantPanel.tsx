
import React, { useState } from 'react';
import './AIAssistantPanel.css';

interface AISuggestion {
  id: string;
  field: string;
  suggestedValue: any;
  confidence: number;
  evidence: string;
  source: 'voice' | 'photo' | 'inference';
  type?: 'data' | 'follow_up' | 'validation';
}

interface AIAssistantPanelProps {
  suggestions: AISuggestion[];
  onAcceptSuggestion: (suggestion: AISuggestion) => void;
  onRejectSuggestion: (suggestion: AISuggestion) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  suggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="ai-assistant-panel">
      <div className="panel-header">
        <h3>🤖 AI Assistant</h3>
        <span className="suggestion-count">{suggestions.length} suggestions</span>
      </div>

      <div className="suggestions-list">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={() => onAcceptSuggestion(suggestion)}
            onReject={() => onRejectSuggestion(suggestion)}
          />
        ))}
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<{
  suggestion: AISuggestion;
  onAccept: () => void;
  onReject: () => void;
}> = ({ suggestion, onAccept, onReject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(suggestion.suggestedValue);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'voice':
        return '🎤';
      case 'photo':
        return '📷';
      case 'inference':
        return '🤖';
      default:
        return '💡';
    }
  };

  return (
    <div className={`suggestion-card confidence-${getConfidenceColor(suggestion.confidence)}`}>
      {/* Header */}
      <div className="suggestion-header">
        <span className="source-icon">{getSourceIcon(suggestion.source)}</span>
        <span className="field-name">{getFieldLabel(suggestion.field)}</span>
        <span className="confidence-badge">
          {Math.round(suggestion.confidence * 100)}%
        </span>
      </div>

      {/* Suggested Value */}
      <div className="suggestion-body">
        {isEditing ? (
          <input
            type="text"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="edit-input"
            autoFocus
          />
        ) : (
          <div className="suggested-value">
            {formatValue(suggestion.suggestedValue)}
          </div>
        )}

        {/* Evidence */}
        {suggestion.evidence && (
          <div className="evidence">
            <span className="evidence-label">Evidence:</span>
            <span className="evidence-text">"{suggestion.evidence}"</span>
          </div>
        )}

        {/* Low Confidence Warning */}
        {suggestion.confidence < 0.8 && (
          <div className="low-confidence-warning">
            ⚠️ Low confidence - please verify with farmer
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="suggestion-actions">
        {isEditing ? (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                suggestion.suggestedValue = editedValue;
                onAccept();
                setIsEditing(false);
              }}
            >
              💾 Save
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-success btn-sm" onClick={onAccept}>
              ✓ Accept
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onReject}>
              ✗ Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Helper functions
function getFieldLabel(fieldId: string): string {
  // Map field IDs to human-readable labels
  const labelMap: Record<string, string> = {
    crop_1_area: 'Crop Area',
    crop_1_type: 'Crop Type',
    fertilizer_use_this_season: 'Fertilizer Use',
    farm_size: 'Farm Size',
    // ... etc
  };
  return labelMap[fieldId] || fieldId.replace(/_/g, ' ');
}

function formatValue(value: any): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
