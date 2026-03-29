import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type CameraMode = 'scan' | 'photo' | 'video';

export default function CameraScreen() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<CameraMode>('scan');
  const [aiStatus, setAiStatus] = useState('Detecting Crop Health...');
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  const handleCapture = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const thumbnail = URL.createObjectURL(file);
    setLastPhoto(thumbnail);
    setAiStatus('Analyzing...');

    // Simulate AI analysis
    setTimeout(() => {
      setAiStatus('Healthy Maize Crop Detected');
    }, 2500);

    if (inputRef.current) inputRef.current.value = '';
  };

  const MODES: CameraMode[] = ['scan', 'photo', 'video'];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Camera capture"
      />

      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Viewfinder brackets */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[200px] w-[260px]">
          {/* Top-left */}
          <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-white/40 rounded-tl-lg" />
          {/* Top-right */}
          <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-white/40 rounded-tr-lg" />
          {/* Bottom-left */}
          <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
          {/* Bottom-right */}
          <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
        </div>
      </div>

      {/* AI Status Pill — centered below brackets */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2">
        <div className="glass-pill flex items-center gap-2 rounded-full px-6 py-2">
          <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse-cyan" />
          <span className="font-sora text-[12px] font-light uppercase tracking-wide text-white/80">
            {aiStatus}
          </span>
        </div>
      </div>

      {/* Header pill */}
      <div className="absolute left-0 right-0 top-0 p-8">
        <div className="glass-pill mx-auto flex max-w-[400px] items-center justify-between rounded-full px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-white text-[20px]">chevron_left</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse-cyan" />
            <span className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
              AI Scanning
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center" aria-label="Flash">
              <span className="material-symbols-outlined text-white/60 text-[20px]">flash_on</span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center" aria-label="Grid">
              <span className="material-symbols-outlined text-white/60 text-[20px]">grid_on</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <div
          className="flex flex-col items-center gap-8 rounded-t-[40px] p-8 pb-12"
          style={{
            background: 'rgba(11,15,25,0.70)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderBottom: 'none',
          }}
        >
          {/* Mode switcher */}
          <div className="flex rounded-full bg-white/5 p-1">
            {MODES.map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-5 py-2 font-manrope text-[10px] font-bold uppercase tracking-widest transition-all ${
                  mode === m
                    ? 'bg-neon-lime text-black'
                    : 'text-white/40'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Controls row */}
          <div className="flex w-full max-w-sm items-center justify-between">
            {/* Last photo thumbnail */}
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] border border-white/20">
              {lastPhoto ? (
                <img src={lastPhoto} alt="Last capture" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/5" />
              )}
            </div>

            {/* Shutter button */}
            <button
              onClick={handleCapture}
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white transition-transform active:scale-90"
              aria-label="Capture"
            >
              <div className="h-16 w-16 rounded-full bg-neon-lime glow-lime-strong" />
            </button>

            {/* Flip camera */}
            <button
              className="glass-pill flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-500 active:rotate-180"
              aria-label="Flip camera"
            >
              <span className="material-symbols-outlined text-white text-[20px]">cached</span>
            </button>
          </div>

          {/* Home indicator */}
          <div className="h-1.5 w-32 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
