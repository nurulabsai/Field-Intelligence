import { useState, useEffect, useRef } from 'react';
import NuruOSLogo from '../components/ui/NuruOSLogo';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const callbackRef = useRef(onComplete);
  callbackRef.current = onComplete;

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
      }
      setProgress(current);
    }, interval);

    const redirect = setTimeout(() => {
      callbackRef.current?.();
    }, 2800);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-deep">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(190,242,100,0.06) 0%, transparent 65%)',
        }}
      />

      {/* Logo */}
      <div className="relative mb-24 z-10">
        {/* Outer glow */}
        <div className="absolute inset-0 scale-[2.5] rounded-full bg-neon-lime opacity-5 blur-3xl" />

        {/* Circle */}
        <div
          className="relative flex h-[124px] w-[124px] items-center justify-center rounded-full border border-neon-lime/30"
          style={{ boxShadow: '0 8px 24px -4px rgba(190,242,100,0.35)' }}
        >
          <NuruOSLogo size={68} color="white" ringColor="rgba(190,242,100,0.4)" bgColor="#0B0F19" />
        </div>
      </div>

      {/* Progress section */}
      <div className="z-10 flex w-full max-w-[280px] flex-col items-center gap-4">
        <p className="font-sora text-lg font-light tracking-tight text-white">
          Initializing Intelligence...
        </p>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E293B]">
          <div
            className="h-full rounded-full bg-neon-lime transition-[width] duration-75 linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-12 font-manrope text-xs tracking-[0.2em] uppercase text-slate-400 opacity-80">
        NURUOS FIELD INTELLIGENCE
      </p>
    </div>
  );
}
