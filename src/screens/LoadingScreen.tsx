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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[linear-gradient(180deg,#171717_0%,#0D0D0D_100%)] z-[9999] font-base">
      {/* Logo */}
      <div
        className="flex flex-col items-center gap-3 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        <div className="flex items-baseline gap-0.5">
          <span className="text-[3rem] font-bold text-white tracking-[-0.03em] font-heading">
            NuruOS
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block ml-0.5 mb-1" />
        </div>

        <span className="text-base text-text-tertiary font-normal tracking-[0.05em]">
          Field Intelligence
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-[200px] h-[3px] bg-border rounded overflow-hidden mt-12 transition-opacity duration-500 delay-300"
        style={{ opacity: logoVisible ? 1 : 0 }}
      >
        <div
          className="h-full bg-accent rounded transition-[width] duration-[50ms] linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tagline */}
      <p
        className="mt-16 text-sm text-text-tertiary font-normal text-center px-6 transition-opacity duration-[600ms] delay-500"
        style={{ opacity: logoVisible ? 1 : 0 }}
      >
        Smarter Field Audits. Powered by AI.
      </p>
    </div>
  );
};

export default LoadingScreen;
