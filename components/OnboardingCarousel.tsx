import React, { useState } from 'react';
import './OnboardingCarousel.css';

interface OnboardingSlide {
  id: string;
  illustration: React.ReactNode;
  title: string;
  description: string;
}

interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      id: 'ai-guidance',
      illustration: <AIGuidanceIllustration />,
      title: 'AI-Assisted Guidance',
      description: 'Real-time object detection and smart suggestions to resource constraints.',
    },
    {
      id: 'offline-sync',
      illustration: <OfflineSyncIllustration />,
      title: 'Works Offline, Syncs Later',
      description: 'Collect data in remote areas. Sync automatically when back online.',
    },
    {
      id: 'multilingual',
      illustration: <MultilingualIllustration />,
      title: 'Multilingual Support',
      description: 'Conduct audits in Swahili or English with AI-powered translation.',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="onboarding-carousel">
      {/* Header */}
      <div className="onboarding-header">
        <button className="btn-text" onClick={onSkip}>
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="onboarding-content">
        <div className="onboarding-illustration">
          {slide.illustration}
        </div>

        <div className="onboarding-text">
          <h2 className="onboarding-title">{slide.title}</h2>
          <p className="onboarding-description">{slide.description}</p>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="onboarding-pagination">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="onboarding-navigation">
        {currentSlide > 0 ? (
          <button className="btn btn-ghost" onClick={handlePrevious}>
            BACK
          </button>
        ) : (
           /* Spacer to keep buttons aligned */
           <div style={{ width: '120px' }}></div>
        )}
        <button className="btn btn-primary" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
        </button>
      </div>
    </div>
  );
};

// Illustration components
const AIGuidanceIllustration = () => (
  <div className="illustration-container">
    <div className="illustration-phone">
      <div className="illustration-content">
        {/* Phone mockup with AI detection overlay */}
        <div className="ai-detection-box">
          <span className="detection-label">📱 Object Detected</span>
        </div>
      </div>
    </div>
    <div className="illustration-person left" />
    <div className="illustration-person right" />
  </div>
);

const OfflineSyncIllustration = () => (
  <div className="illustration-container">
    <div className="illustration-phone">
      <div className="illustration-content">
        <div className="offline-icon">📶❌</div>
        <div className="sync-icon">⬆️</div>
      </div>
    </div>
  </div>
);

const MultilingualIllustration = () => (
  <div className="illustration-container">
    <div className="illustration-phone">
      <div className="illustration-content">
        <div className="language-flags">
            <span>🇬🇧</span>
            <span>🇹🇿</span>
        </div>
      </div>
    </div>
  </div>
);