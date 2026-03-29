/**
 * SITE SAFETY CHECK SCREEN
 * 
 * Matches the audit form screen showing:
 * - Header with back button and title
 * - Location & Time info
 * - Checklist items (AI Automatic, Electricity/Situation)
 * - Notes section
 * - Navigation buttons
 */

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Bot, Zap, Shield, FileText, Loader2 } from 'lucide-react';
import './SiteSafetyCheckScreen.css';
import { VoiceInputButton } from './ai/VoiceInputButton';
import { transcribeAudio } from '../services/aiService';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  type?: 'automatic' | 'manual';
}

interface SiteSafetyCheckScreenProps {
  auditTitle: string;
  location: string;
  onBack: () => void;
  onNext: () => void;
  onSave: (data: any) => void;
}

export const SiteSafetyCheckScreen: React.FC<SiteSafetyCheckScreenProps> = ({
  auditTitle,
  location,
  onBack,
  onNext,
  onSave,
}) => {
  const [locationTime] = useState({
    location: location || 'Gate Building 202',
    time: new Date().toLocaleString(),
  });

  const [aiAutomatic, setAiAutomatic] = useState<ChecklistItem>({
    id: 'ai_automatic',
    label: 'AI Automatic Assessment',
    checked: true,
    type: 'automatic',
  });

  const [electricityChecks, setElectricityChecks] = useState<ChecklistItem[]>([
    {
      id: 'current_flowing',
      label: 'Cables neatly organized near hazards',
      checked: false,
    },
    {
      id: 'power_check',
      label: 'Power supply grounded',
      checked: false,
    },
  ]);

  const [safetyMeasures, setSafetyMeasures] = useState<ChecklistItem[]>([
    {
      id: 'safety_hazard',
      label: 'No visible safety hazards',
      checked: false,
    },
    {
      id: 'check_records',
      label: 'Maintenance records checked',
      checked: false,
    },
  ]);

  const [notes, setNotes] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const handleVoiceNote = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      const text = await transcribeAudio(audioBlob, 'en');
      setNotes(prev => prev ? `${prev}\n\n[Voice Entry]: ${text}` : `[Voice Entry]: ${text}`);
    } catch (e) {
      console.error(e);
      alert("Voice processing failed. Please try again.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleCheckboxChange = (
    section: 'ai' | 'electricity' | 'safety',
    id: string
  ) => {
    if (section === 'ai') {
      setAiAutomatic((prev) => ({ ...prev, checked: !prev.checked }));
    } else if (section === 'electricity') {
      setElectricityChecks((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      );
    } else {
      setSafetyMeasures((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      );
    }
  };

  const handleSave = () => {
    const data = {
      locationTime,
      aiAutomatic,
      electricityChecks,
      safetyMeasures,
      notes,
    };
    onSave(data);
  };

  return (
    <div className="site-safety-screen animate-in slide-in-from-right">
      {/* Header */}
      <div className="safety-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="safety-title">{auditTitle}</h1>
      </div>

      {/* Content */}
      <div className="safety-content">
        {/* Location & Time */}
        <section className="safety-section">
          <h2 className="section-title">
            <MapPin className="w-5 h-5 text-teal-600" />
            Location & Time
          </h2>
          <div className="info-card">
            <div className="info-item">
              <div className="info-icon">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="info-text">{locationTime.location}</div>
                <span className="info-subtext flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {locationTime.time}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Automatic */}
        <section className="safety-section">
          <h2 className="section-title">
            <Bot className="w-5 h-5 text-purple-600" />
            AI Guidance
          </h2>
          <label className={`checkbox-card ${aiAutomatic.checked ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={aiAutomatic.checked}
              onChange={() => handleCheckboxChange('ai', aiAutomatic.id)}
            />
            <span className="checkbox-label">{aiAutomatic.label}</span>
            <span className="checkbox-badge automatic">Auto</span>
          </label>
        </section>

        {/* Electricity Situation */}
        <section className="safety-section">
          <h2 className="section-title">
            <Zap className="w-5 h-5 text-yellow-600" />
            Electricity Situation
          </h2>
          <div className="checkbox-group">
            {electricityChecks.map((item) => (
              <label key={item.id} className={`checkbox-card ${item.checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheckboxChange('electricity', item.id)}
                />
                <span className="checkbox-label">{item.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Safety Measures */}
        <section className="safety-section">
          <h2 className="section-title">
            <Shield className="w-5 h-5 text-green-600" />
            Safety Measures
          </h2>
          <div className="checkbox-group">
            {safetyMeasures.map((item) => (
              <label key={item.id} className={`checkbox-card ${item.checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheckboxChange('safety', item.id)}
                />
                <span className="checkbox-label">{item.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="safety-section">
          <div className="flex justify-between items-center mb-2">
            <h2 className="section-title mb-0">
              <FileText className="w-5 h-5 text-slate-600" />
              Notes
            </h2>
            {isProcessingVoice && <span className="text-xs text-teal-600 animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing...</span>}
          </div>
          <div className="mb-2">
            <VoiceInputButton
              language="en"
              onRecordingComplete={handleVoiceNote}
            />
          </div>
          <textarea
            className="notes-textarea"
            placeholder="Type or use voice to add observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </section>
      </div>

      {/* Footer Actions */}
      <div className="safety-footer">
        <button className="btn btn-secondary btn-lg" onClick={handleSave}>
          Save Draft
        </button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          Next Section →
        </button>
      </div>
    </div>
  );
};
