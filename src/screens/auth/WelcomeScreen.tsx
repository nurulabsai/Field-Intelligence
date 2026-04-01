import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import NuruLogo from '../../components/NuruLogo';

interface WelcomeScreenProps {
  onNavigateToLogin?: () => void;
  onNavigateToSignUp?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigateToLogin, onNavigateToSignUp }) => {
  const [loading, setLoading] = useState(false);

  // Allow the user to bypass this static mockup and enter the application
  const handleMockSignIn = async () => {
    setLoading(true);
    try {
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
    } catch (e) {
      console.warn('Bypass login failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center relative font-base overflow-hidden px-6">
      
      {/* Dark Subtle Grid Background Overlays */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient Gradient Orbs — Stitch spec */}
      <div className="absolute top-[-80px] left-[-60px] w-[300px] h-[300px] bg-[#BEF264] rounded-full blur-[140px] opacity-[0.07] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-40px] w-[280px] h-[280px] bg-[#67E8F9] rounded-full blur-[140px] opacity-[0.06] pointer-events-none" />

      {/* Subtle Radial Gradient overlay to center focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,#0B0F19_80%)] pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center">
        
        {/* NuruOS Logo Container */}
        <div className="relative mb-8">
          {/* Outer glowing shadow behind squircle */}
          <div className="absolute inset-0 bg-accent rounded-[32px] blur-[40px] opacity-20" />
          
          <div className="w-[120px] h-[120px] rounded-[36px] bg-[#151924] border border-white/5 flex items-center justify-center relative shadow-2xl">
            {/* Inner Ring with SVG Logo */}
            <div className="w-[72px] h-[72px] rounded-full border border-white/10 flex items-center justify-center bg-transparent">
              <NuruLogo size={40} />
            </div>
          </div>
        </div>

        {/* NuruOS Title Text */}
        <h1 className="text-[2.75rem] font-light text-white mb-6 font-heading tracking-tight flex items-baseline">
          Nuru<span className="text-accent drop-shadow-[0_0_12px_rgba(190,242,100,0.4)]">OS</span>
        </h1>

        {/* Subtitles */}
        <div className="flex flex-col items-center gap-1.5 mb-14 text-center">
          <p className="text-white text-[17px] font-medium tracking-wide">
            Smarter Field Audits.
          </p>
          <p className="text-white/50 text-[17px] font-normal tracking-wide">
            Powered by AI.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-4">
          <button 
            onClick={onNavigateToSignUp}
            className="w-full min-h-[68px] py-4 rounded-full bg-accent text-black text-[14px] font-semibold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer border-none shadow-[0_0_20px_rgba(190,242,100,0.15)] transition-transform hover:scale-105 active:scale-95"
          >
            Get Started
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={handleMockSignIn}
            disabled={loading}
            className="w-full min-h-[68px] py-4 rounded-full bg-white/[0.04] backdrop-blur-2xl text-white text-[14px] font-semibold tracking-widest uppercase flex items-center justify-center cursor-pointer border border-[#67E8F9]/30 shadow-[0_0_20px_rgba(103,232,249,0.08)] transition-colors hover:bg-white/[0.08] hover:border-[#67E8F9]/50 disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </div>

      </div>

      {/* Bottom SafeArea Indicator (Mock) */}
      <div className="absolute bottom-2 w-full flex justify-center pointer-events-none">
        <div className="w-[134px] h-[5px] rounded-full bg-white/20" />
      </div>

    </div>
  );
};

export default WelcomeScreen;
