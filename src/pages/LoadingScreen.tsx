import { useState, useEffect, useRef } from 'react';

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
          <svg width="68" height="68" viewBox="0 0 100 100" fill="none" aria-label="NuruOS logo">
            <rect x="22" y="22" width="18" height="56" rx="9" fill="white" />
            <rect x="60" y="22" width="18" height="56" rx="9" fill="white" />
            <path d="M38 32L62 68" stroke="white" strokeWidth="16" strokeLinecap="round" />
            <path d="M42 45L58 55" stroke="#0B0F19" strokeWidth="6" strokeLinecap="round" />
          </svg>
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
