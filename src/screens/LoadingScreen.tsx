import React, { useState, useEffect, useRef } from 'react';
import NuruLogo from '../components/NuruLogo';

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
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-bg-primary font-base overflow-hidden"
      role="status"
      aria-label="Loading NuruOS"
    >
      {/* Radial ambient glow — Stitch spec */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(190,242,100,0.06),transparent_65%)] pointer-events-none" />

      {/* Main Content Wrapper */}
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-[320px] px-8 transition-all duration-1000 ease-out"
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        {/* Logo Container — Stitch neon-glow-diffused circle */}
        <div className="relative mb-24">
          <div className="absolute inset-0 bg-accent opacity-5 blur-3xl rounded-full scale-[2.5]" />
          <div className="w-[124px] h-[124px] rounded-full border border-accent/30 flex items-center justify-center relative bg-bg-primary shadow-[0_0_40px_4px_rgba(190,242,100,0.35)]">
            <NuruLogo size={68} />
          </div>
        </div>

        {/* Status text + progress bar */}
        <div className="w-full flex flex-col items-center space-y-6">
          <p className="font-heading font-light text-lg text-white tracking-tight leading-none">
            Initializing Intelligence…
          </p>
          <div
            className="w-full h-[6px] bg-[#1E293B] rounded-full overflow-hidden relative"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-accent rounded-full absolute top-0 left-0 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom tagline — Stitch spec */}
      <div
        className="absolute bottom-12 flex flex-col items-center w-full px-6 transition-opacity duration-1000 delay-500"
        style={{ opacity: logoVisible ? 0.8 : 0 }}
      >
        <p className="font-base text-xs font-medium tracking-[0.2em] text-text-secondary uppercase text-center">
          NuruOS Field Intelligence
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
