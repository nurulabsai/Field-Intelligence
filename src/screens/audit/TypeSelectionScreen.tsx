import React from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import { useNavigate } from 'react-router-dom';

const TypeSelectionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary font-base px-6 pt-16 pb-32">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 px-2">
          <h1 className="text-[32px] font-heading font-light text-white tracking-tight">
            Select Audit Type
          </h1>
          <button 
            type="button"
            aria-label="Close audit type selection"
            onClick={() => navigate('/dashboard')}
            className="w-12 h-12 shrink-0 rounded-full bg-bg-card border border-border flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Farm Audit Card */}
          <div className="nuru-glassmorphism rounded-[32px] p-7">
            {/* Top Row: Icon & Badge */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-[64px] h-[64px] rounded-[22px] bg-accent/[0.08] border border-accent/[0.15] flex items-center justify-center shrink-0">
                <MaterialIcon name="eco" className="text-accent" size={32} />
              </div>
              <div className="px-3.5 py-1.5 rounded-full border border-white/10 mt-1">
                <span className="text-accent text-[10px] uppercase font-bold tracking-[0.1em]">
                  OUTDOOR
                </span>
              </div>
            </div>

            {/* Text Details */}
            <h2 className="text-[26px] font-semibold font-heading text-white tracking-tight mb-3">
              Farm Audit
            </h2>
            <p className="text-text-secondary text-[15px] leading-relaxed mb-8 font-medium pr-4">
              Comprehensive assessment of agricultural health, irrigation systems, and soil quality metrics across large terrains.
            </p>

            {/* Avatars & Stats */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-bg-card bg-bg-tertiary flex items-center justify-center z-10">
                  <span className="text-white/50 text-[10px] font-bold">1+</span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-bg-card bg-cyan flex items-center justify-center z-0">
                  <MaterialIcon name="person" size={14} className="text-black/50" />
                </div>
              </div>
              <span className="text-text-tertiary text-[13px] font-semibold">
                Farm workflow templates
              </span>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => navigate('/audit/wizard/farm')}
              className="w-full bg-accent hover:bg-accent-light text-black font-bold text-[16px] py-[18px] rounded-full shadow-glow-accent transition-all active:scale-[0.98] cursor-pointer border-none"
            >
              Start Farm Audit
            </button>
          </div>

          {/* Business Inspection Card */}
          <div className="nuru-glassmorphism rounded-[32px] p-7">
            {/* Top Row: Icon & Badge */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-[64px] h-[64px] rounded-[22px] bg-cyan/[0.08] border border-cyan/[0.15] flex items-center justify-center shrink-0">
                <MaterialIcon name="store" className="text-cyan" size={32} />
              </div>
              <div className="px-3.5 py-1.5 rounded-full border border-white/10 mt-1">
                <span className="text-cyan text-[10px] uppercase font-bold tracking-[0.1em]">
                  RETAIL
                </span>
              </div>
            </div>

            {/* Text Details */}
            <h2 className="text-[26px] font-semibold font-heading text-white tracking-tight mb-3">
              Business Inspection
            </h2>
            <p className="text-text-secondary text-[15px] leading-relaxed mb-8 font-medium pr-4">
              Standard compliance audit for retail locations, focusing on inventory, safety protocols, and operational standards.
            </p>

            {/* Avatars & Stats */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-bg-card bg-gradient-to-tr from-orange-200 to-amber-400 overflow-hidden z-20 flex items-center justify-center">
                   <MaterialIcon name="person" size={14} className="text-black/50" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-bg-card bg-bg-tertiary flex items-center justify-center z-10">
                  <span className="text-cyan text-[10px] font-bold">AJ</span>
                </div>
              </div>
              <span className="text-text-tertiary text-[13px] font-semibold">
                Business workflow templates
              </span>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => navigate('/audit/wizard/business')}
              className="w-full bg-cyan hover:bg-cyan-light text-black font-bold text-[16px] py-[18px] rounded-full nuru-glow-cyan transition-all active:scale-[0.98] cursor-pointer border-none"
            >
              Start Business Audit
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TypeSelectionScreen;
