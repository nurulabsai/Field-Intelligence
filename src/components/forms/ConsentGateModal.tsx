import React, { useCallback } from 'react';
import MaterialIcon from '../MaterialIcon';
import ConsentSection from './ConsentSection';
import {
  ConsentRecord,
  ConsentAuditType,
  createConsentRecord,
  isConsentComplete,
} from '../../lib/consent-types';

interface ConsentGateModalProps {
  /** Existing consent record if resuming, otherwise a new one is created. */
  consent: ConsentRecord | undefined;
  onChange: (next: ConsentRecord) => void;
  onAccept: () => void;
  onDecline?: () => void;
  audit_type: ConsentAuditType;
  language: 'en' | 'sw';
  subjectLabel?: { en: string; sw: string };
}

/**
 * Full-screen consent gate that hosts the structured ConsentSection.
 * Replaces the legacy click-through ConsentGate with full data capture.
 */
const ConsentGateModal: React.FC<ConsentGateModalProps> = ({
  consent,
  onChange,
  onAccept,
  onDecline,
  audit_type,
  language,
  subjectLabel,
}) => {
  const record = consent ?? createConsentRecord(audit_type, language);

  // Initialise on first render if caller hadn't created one yet.
  const ensureRecord = useCallback(() => {
    if (!consent) onChange(record);
  }, [consent, record, onChange]);
  React.useEffect(ensureRecord, [ensureRecord]);

  const handleComplete = useCallback(() => {
    if (!isConsentComplete(record)) return;
    onAccept();
  }, [record, onAccept]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-bg-primary overflow-y-auto">
      <div className="max-w-2xl w-full p-4 sm:p-6">
        {onDecline && (
          <button
            type="button"
            onClick={onDecline}
            className="mb-4 flex items-center gap-2 text-sm text-text-secondary bg-transparent border-none cursor-pointer font-inherit"
          >
            <MaterialIcon name="arrow_back" size={18} />
            {language === 'sw' ? 'Ghairi' : 'Cancel'}
          </button>
        )}
        <div className="nuru-glass-card rounded-[24px] border border-border-glass p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <ConsentSection
            consent={record}
            onChange={onChange}
            onComplete={handleComplete}
            subjectLabel={subjectLabel}
          />
        </div>
      </div>
    </div>
  );
};

export default ConsentGateModal;
