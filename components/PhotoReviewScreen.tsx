/**
 * PHOTO REVIEW & ANNOTATION SCREEN
 * 
 * Matches the photo review screen showing:
 * - Photo preview
 * - Media quality indicators
 * - AI tags/labels
 * - Add notes section
 * - Action buttons (Retake, Save Media)
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Tag, FileText, BarChart2 } from 'lucide-react';
import './PhotoReviewScreen.css';

export interface PhotoAnnotationData {
  photo: File | string;
  media: {
    highFidelity: boolean;
  };
  aiTags: string[];
  additionalNotes: string;
}

interface PhotoReviewScreenProps {
  photo: File | string;
  aiTags?: string[];
  onRetake: () => void;
  onSave: (data: PhotoAnnotationData) => void;
  onBack: () => void;
}

export const PhotoReviewScreen: React.FC<PhotoReviewScreenProps> = ({
  photo,
  aiTags = [],
  onRetake,
  onSave,
  onBack,
}) => {
  const [mediaQuality, setMediaQuality] = useState({
    highFidelity: true,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Default suggested tags
  const availableTags = [
    'Generator',
    'Mining tools',
    'Corrosion',
    'Damage',
    'Safety hazard',
    'Equipment',
    'Infrastructure',
    'Vegetation',
    'Water Source'
  ];

  useEffect(() => {
    if (typeof photo === 'string') {
        setPhotoUrl(photo);
    } else if (photo instanceof File) {
        const url = URL.createObjectURL(photo);
        setPhotoUrl(url);
        return () => URL.revokeObjectURL(url);
    }
  }, [photo]);

  // Pre-select tags passed in props
  useEffect(() => {
      if (aiTags.length > 0) {
          setSelectedTags(prev => [...new Set([...prev, ...aiTags])]);
      }
  }, [aiTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave({
      photo,
      media: mediaQuality,
      aiTags: selectedTags,
      additionalNotes,
    });
  };

  return (
    <div className="photo-review-screen animate-in slide-in-from-right">
      {/* Header */}
      <div className="review-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="review-title">Review & Annotate</h1>
      </div>

      {/* Content */}
      <div className="review-content">
        {/* Photo Preview */}
        <div className="photo-preview-section">
          {photoUrl ? (
              <img src={photoUrl} alt="Captured" className="photo-preview" />
          ) : (
              <div className="text-white">Loading image...</div>
          )}
        </div>

        {/* Media Quality */}
        <section className="review-section">
          <h2 className="section-title">
            <BarChart2 className="w-5 h-5 text-teal-600" />
            Media Quality
          </h2>
          <label className={`checkbox-card ${mediaQuality.highFidelity ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={mediaQuality.highFidelity}
              onChange={(e) =>
                setMediaQuality({ highFidelity: e.target.checked })
              }
            />
            <span className="checkbox-label flex-1 font-medium">High Fidelity / Clear Image</span>
            {mediaQuality.highFidelity && <span className="check-icon"><Check className="w-4 h-4" /></span>}
          </label>
        </section>

        {/* AI Tags */}
        <section className="review-section">
          <h2 className="section-title">
            <Tag className="w-5 h-5 text-indigo-600" />
            AI Tags
          </h2>
          <div className="tags-grid">
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${
                  selectedTags.includes(tag) ? 'active' : ''
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Add Notes */}
        <section className="review-section">
          <h2 className="section-title">
            <FileText className="w-5 h-5 text-slate-600" />
            Add Notes
          </h2>
          <textarea
            className="notes-textarea"
            placeholder="Add any additional notes or observations regarding this photo..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={4}
          />
        </section>
      </div>

      {/* Footer Actions */}
      <div className="review-footer">
        <button className="btn btn-secondary btn-lg" onClick={onRetake}>
          Retake
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          Save Media
        </button>
      </div>
    </div>
  );
};