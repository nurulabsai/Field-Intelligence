import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import NuruLogo from '../../components/NuruLogo';

interface WelcomeScreenProps {
  onNavigateToLogin?: () => void;
  onNavigateToSignUp?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigateToLogin, onNavigateToSignUp }) => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      onNavigateToLogin?.();
    } catch (e) {
      console.warn('Navigation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-between relative font-base antialiased overflow-hidden">

      {/* Grid pattern background — Stitch spec: bg-grid-pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient Gradient Orbs — Stitch spec */}
      <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[60%] bg-accent/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[80%] h-[60%] bg-cyan/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Content Area — Stitch spec: flex-1 centered */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-10 relative z-10 pt-20">

        {/* NuruOS Logo Container — Stitch spec: w-28 h-28 rounded-[32px] */}
        <div className="mb-16 relative">
          <div className="w-28 h-28 bg-bg-secondary rounded-[32px] flex items-center justify-center relative z-10 border border-white/5 shadow-[0_0_40px_rgba(190,242,100,0.12)]">
            <div className="relative w-16 h-16 flex items-center justify-center border border-white/10 rounded-full" style={{ filter: 'drop-shadow(0 0 10px rgba(190,242,100,0.3))' }}>
              <NuruLogo size={40} />
            </div>
          </div>
          <div className="absolute inset-0 bg-accent/5 rounded-[32px] blur-2xl -z-10 translate-y-2" />
        </div>

        {/* Title — Stitch spec: text-[44px] font-sora font-light */}
        <h1 className="text-[44px] font-heading font-light tracking-tight mb-6 text-center leading-none text-white">
          Nuru<span className="text-accent" style={{ textShadow: '0 0 12px rgba(190,242,100,0.5)' }}>OS</span>
        </h1>

        {/* Subtitles — Stitch spec */}
        <p className="text-white text-center text-lg font-base font-medium leading-relaxed max-w-[280px]">
          Smarter Field Audits.<br />
          <span className="opacity-60 font-normal">Powered by AI.</span>
        </p>
      </div>

      {/* Action Buttons — Stitch spec: px-10 pb-20 */}
      <div className="w-full px-10 pb-20 z-10 flex flex-col gap-5 max-w-md">
        <button
          type="button"
          onClick={onNavigateToSignUp}
          className="w-full bg-accent text-bg-primary h-[68px] rounded-full font-bold text-[15px] shadow-[0_20px_40px_-12px_rgba(190,242,100,0.25)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 tracking-[0.08em] cursor-pointer border-none uppercase"
        >
          Get Started
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full h-[68px] rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all duration-200 tracking-[0.08em] cursor-pointer uppercase disabled:opacity-50 text-white"
          style={{
            background: 'rgba(11,15,25,0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(103,232,249,0.3)',
            boxShadow: '0 0 15px rgba(103,232,249,0.1)',
          }}
        >
          {loading ? 'Entering\u2026' : 'Sign In'}
        </button>

        {/* Home indicator — Stitch spec */}
        <div className="flex justify-center mt-10">
          <div className="w-32 h-1.5 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
