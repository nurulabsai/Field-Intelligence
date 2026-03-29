import React from 'react';
import { ArrowRight } from 'lucide-react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="font-sans text-white flex flex-col items-center justify-between relative antialiased bg-[#0B0F19] min-h-screen">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none"></div>
      <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[60%] bg-[#BEF264]/5 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[80%] h-[60%] bg-[#67E8F9]/5 blur-[140px] rounded-full pointer-events-none"></div>
      
      {/* Upper Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-10 relative z-10 pt-20">
        <div className="mb-16 relative">
          <div className="w-28 h-28 bg-[#111622] rounded-[32px] flex items-center justify-center relative z-10 border border-white/5 shadow-glow-logo">
            <div className="relative w-16 h-16 flex items-center justify-center border border-white/10 rounded-full logo-glow-filter">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 20C22 18.8954 22.8954 18 24 18H34C35.1046 18 36 18.8954 36 20V80C36 81.1046 35.1046 82 34 82H24C22.8954 82 22 81.1046 22 80V20Z" fill="white"></path>
                <path d="M64 20C64 18.8954 64.8954 18 66 18H76C77.1046 18 78 18.8954 78 20V80C78 81.1046 77.1046 82 76 82H66C64.8954 82 64 81.1046 64 80V20Z" fill="white"></path>
                <path d="M30 25L70 75L76 70L36 20L30 25Z" fill="white"></path>
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 bg-[#BEF264]/5 rounded-[32px] blur-2xl -z-10 translate-y-2"></div>
        </div>
        
        <h1 className="text-[44px]  font-light tracking-tight mb-6 text-center leading-none">
          Nuru<span className="text-[#BEF264] text-glow-lime">OS</span>
        </h1>
        
        <p className="text-white text-center text-[18px] font-sans font-medium leading-relaxed max-w-[280px]">
          Smarter Field Audits.<br/>
          <span className="opacity-60 font-normal">Powered by AI.</span>
        </p>
      </div>
      
      {/* Lower Buttons */}
      <div className="w-full px-10 pb-20 z-10 flex flex-col gap-5 max-w-md">
        <button 
          onClick={onGetStarted}
          className="w-full bg-[#BEF264] text-[#0B0F19] h-[68px] rounded-full font-bold text-[15px] shadow-soft-lime active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 tracking-[0.08em]"
        >
          GET STARTED
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button 
          onClick={onSignIn}
          className="w-full glass-dark-cyan text-white h-[68px] rounded-full font-semibold text-[15px] shadow-glow-cyan-subtle active:scale-[0.98] transition-all duration-200 tracking-[0.08em]"
        >
          SIGN IN
        </button>
      </div>
    </div>
  );
};
