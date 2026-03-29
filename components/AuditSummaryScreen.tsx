/**
 * AUDIT SUMMARY & SUBMISSION SCREEN
 * 
 * Matches the final submission screen showing:
 * - Audit title
 * - Completion checkmarks
 * - Supporting notes
 * - Submit button
 */

import React from 'react';
import { ArrowLeft, Check, Circle } from 'lucide-react';
import './AuditSummaryScreen.css';

interface AuditSection {
  id: string;
  title: string;
  completed: boolean;
  itemCount?: number;
}

interface AuditSummaryScreenProps {
  auditTitle: string;
  sections: AuditSection[];
  supportingNotes: string[];
  onBack: () => void;
  onSubmit: () => void;
  submitting?: boolean;
}

export const AuditSummaryScreen: React.FC<AuditSummaryScreenProps> = ({
  auditTitle,
  sections,
  supportingNotes,
  onBack,
  onSubmit,
  submitting = false,
}) => {
  const completedCount = sections.filter((s) => s.completed).length;
  const totalCount = sections.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="audit-summary-screen animate-in slide-in-from-right">
      {/* Header */}
      <div className="summary-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="summary-title">Audit Summary</h1>
      </div>

      {/* Content */}
      <div className="summary-content">
        {/* Audit Title */}
        <div className="audit-title-card">
          <h2 className="audit-name">{auditTitle}</h2>
          <div className="completion-badge">
            {completionPercentage}% Complete
          </div>
        </div>

        {/* Completion Progress */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {completedCount} of {totalCount} sections completed
          </div>
        </div>

        {/* Sections Checklist */}
        <section className="summary-section">
          <h3 className="section-heading">📋 Completed Sections</h3>
          <div className="checklist">
            {sections.map((section) => (
              <div key={section.id} className="checklist-item">
                <div className="check-icon-container">
                  {section.completed ? (
                    <span className="check-icon completed"><Check className="w-5 h-5" /></span>
                  ) : (
                    <span className="check-icon incomplete"><Circle className="w-5 h-5" /></span>
                  )}
                </div>
                <div className="checklist-content">
                  <div className="checklist-title">{section.title}</div>
                  {section.itemCount && (
                    <div className="checklist-subtitle">
                      {section.itemCount} items
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Supporting Notes */}
        {supportingNotes.length > 0 && (
          <section className="summary-section">
            <h3 className="section-heading">📝 Supporting Notes (Optional)</h3>
            <div className="notes-list">
              {supportingNotes.map((note, index) => (
                <div key={index} className="note-item">
                  <span className="note-bullet">•</span>
                  <span className="note-text">{note}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="summary-footer">
        <button
          className="btn btn-primary btn-xl btn-full-width"
          onClick={onSubmit}
          disabled={submitting || completionPercentage < 100}
        >
          {submitting ? 'SUBMITTING AUDIT...' : 'SUBMIT AUDIT'}
        </button>
        {completionPercentage < 100 && (
          <div className="warning-text">
            ⚠️ Complete all sections before submitting
          </div>
        )}
      </div>
    </div>
  );
};