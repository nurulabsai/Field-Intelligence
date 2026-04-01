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
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-[#0B0F19] font-base nuru-screen overflow-hidden">
      
      {/* Absolute dark background to override any theme bleed */}
      <div className="absolute inset-0 bg-[#0B0F19]" />

      {/* Main Content Wrapper */}
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-[320px] transition-all duration-1000 ease-out"
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        
        {/* Logo Container with Stitch-spec diffuse glow */}
        <div className="relative mb-[120px]">
          {/* Outer diffuse glow */}
          <div className="absolute inset-0 bg-accent rounded-full blur-[45px] opacity-[0.25] transform scale-[2.5]" />
          
          {/* The Logo Circle — matching Stitch: border lime/30, neon-glow-diffused */}
          <div className="relative w-[124px] h-[124px] rounded-full bg-[#0B0F19] border border-[#BEF264]/30 flex items-center justify-center shadow-[0_0_40px_rgba(190,242,100,0.15)]">
            <NuruLogo size={68} />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-white font-light text-[19px] tracking-wide mb-5 text-center font-heading">
          Initializing Intelligence...
        </p>

        {/* Progress Bar Container */}
        <div className="w-full h-[6px] bg-[#1E2534] rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-accent rounded-full transition-all duration-[50ms] ease-linear shadow-[0_0_12px_rgba(190,242,100,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Absolute Bottom Tagline */}
      <div 
        className="absolute bottom-10 w-full text-center transition-opacity duration-1000 delay-500"
        style={{ opacity: logoVisible ? 1 : 0 }}
      >
        <p className="text-white/40 text-[10px] font-bold tracking-[0.25em] uppercase">
          NuruOS Field Intelligence by Nuru Labs
        </p>
      </div>

    </div>
  );
};

export default LoadingScreen;
