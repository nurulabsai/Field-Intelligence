import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress from 0 to 100 over ~2.5 seconds
    const duration = 2500;
    const intervalTime = 50; 
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 200); // 200ms delay at 100%
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="antialiased text-white selection:bg-[#BEF264]/30 bg-[#0B0F19] min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(190,242,100,0.06),transparent_65%)] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[320px] px-8">
        
        {/* Animated Logo Container */}
        <div className="relative mb-24"> 
          {/* Pulsing Backlight */}
          <div className="absolute inset-0 bg-[#BEF264] opacity-5 blur-3xl rounded-full scale-[2.5] animate-pulse"></div>
          
          <div className="w-[124px] h-[124px] rounded-full border border-[#BEF264]/30 neon-glow-diffused flex items-center justify-center relative bg-[#0B0F19]">
            <svg className="object-contain" fill="none" height="68" viewBox="0 0 100 100" width="68" xmlns="http://www.w3.org/2000/svg">
              <rect fill="white" height="56" rx="9" width="18" x="22" y="22"></rect>
              <rect fill="white" height="56" rx="9" width="18" x="60" y="22"></rect>
              <path d="M38 32 L62 68" stroke="white" strokeLinecap="round" strokeWidth="16"></path>
              <path d="M42 45 L58 55" stroke="#0B0F19" strokeLinecap="round" strokeWidth="6"></path>
            </svg>
          </div>
        </div>
        
        <div className="w-full flex flex-col items-center space-y-6">
          <div className=" font-light text-[18px] text-white tracking-tight leading-none">
            Initializing Intelligence...
          </div>
          
          {/* Progress Bar Track */}
          <div className="w-full h-[6px] bg-[#1E293B] rounded-full overflow-hidden relative">
            {/* Animated Progress Fill */}
            <div 
              className="h-full bg-[#BEF264] rounded-full absolute top-0 left-0 transition-all duration-[50ms] ease-linear"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-12 flex flex-col items-center w-full px-6">
        <p className="font-sans text-[12px] font-medium tracking-[0.2em] text-[#94A3B8] uppercase text-center opacity-80">
          NuruOS Field Intelligence
        </p>
      </div>
    </div>
  );
};
