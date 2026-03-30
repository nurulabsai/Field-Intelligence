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
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999] font-base nuru-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(190,242,100,0.08),transparent_64%)] pointer-events-none" />
      {/* Logo */}
      <div
        className="flex flex-col items-center gap-3 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10"
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        <div className="w-[124px] h-[124px] rounded-full border border-accent/30 nuru-neon-ring flex items-center justify-center bg-bg-primary mb-8">
          <span className="text-[2.2rem] font-heading font-semibold tracking-tight text-white">
            N
          </span>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[2.1rem] font-heading font-light text-white tracking-tight">Initializing Intelligence...</span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-[260px] h-[6px] bg-bg-tertiary rounded-full overflow-hidden mt-10 transition-opacity duration-500 delay-300 relative z-10"
        style={{ opacity: logoVisible ? 1 : 0 }}
      >
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-[50ms] linear shadow-[0_0_12px_rgba(190,242,100,0.45)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tagline */}
      <p
        className="mt-16 text-xs text-text-tertiary font-medium tracking-[0.2em] uppercase text-center px-6 transition-opacity duration-[600ms] delay-500 relative z-10"
        style={{ opacity: logoVisible ? 1 : 0 }}
      >
        NuruOS Field Intelligence
      </p>
    </div>
  );
};

export default LoadingScreen;
