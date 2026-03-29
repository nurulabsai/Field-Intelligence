import React, { useState, useEffect, useRef } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const fadeTimer = setTimeout(() => setLogoVisible(true), 100);
    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    const duration = 2500;
    const interval = 16;
    const step = (interval / duration) * 100;
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(() => onCompleteRef.current(), 200);
      }
      setProgress(current);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #171717 0%, #0D0D0D 100%)',
        zIndex: 9999,
        fontFamily: 'var(--font-family-base, Inter, sans-serif)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-family-heading, Inter, sans-serif)',
            }}
          >
            NuruOS
          </span>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#F0513E',
              display: 'inline-block',
              marginLeft: '2px',
              marginBottom: '4px',
            }}
          />
        </div>

        <span
          style={{
            fontSize: '1rem',
            color: '#6B7280',
            fontWeight: 400,
            letterSpacing: '0.05em',
          }}
        >
          Field Intelligence
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '200px',
          height: '3px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: '48px',
          opacity: logoVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.3s',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#F0513E',
            borderRadius: '4px',
            transition: 'width 0.05s linear',
          }}
        />
      </div>

      {/* Tagline */}
      <p
        style={{
          marginTop: '64px',
          fontSize: '0.875rem',
          color: '#6B7280',
          fontWeight: 400,
          opacity: logoVisible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.5s',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        Smarter Field Audits. Powered by AI.
      </p>
    </div>
  );
};

export default LoadingScreen;
