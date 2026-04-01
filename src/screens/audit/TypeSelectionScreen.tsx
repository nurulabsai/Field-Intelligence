import React from 'react';
import { X, Leaf, Store, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TypeSelectionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] font-base px-6 pt-16 pb-32">
      <div className="w-full max-w-lg mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 px-2">
          <h1 className="text-[32px] font-heading font-light text-white tracking-tight">
            Select Audit Type
          </h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-[42px] h-[42px] shrink-0 rounded-full bg-[#121623] border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Farm Audit Card */}
          <div className="bg-[#0F1420]/60 backdrop-blur-2xl border border-white/[0.06] rounded-[32px] p-7 shadow-xl">
            {/* Top Row: Icon & Badge */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-[64px] h-[64px] rounded-[22px] bg-[#BEF264]/[0.08] border border-[#BEF264]/[0.15] flex items-center justify-center shrink-0">
                <Leaf className="text-[#BEF264]" size={32} strokeWidth={1.5} />
              </div>
              <div className="px-3.5 py-1.5 rounded-full border border-white/10 mt-1">
                <span className="text-[#BEF264] text-[10px] uppercase font-bold tracking-[0.1em]">
                  OUTDOOR
                </span>
              </div>
            </div>

            {/* Text Details */}
            <h2 className="text-[26px] font-semibold text-white tracking-tight mb-3">
              Farm Audit
            </h2>
            <p className="text-[#6D7A94] text-[15px] leading-relaxed mb-8 font-medium pr-4">
              Comprehensive assessment of agricultural health, irrigation systems, and soil quality metrics across large terrains.
            </p>

            {/* Avatars & Stats */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-[#121623] bg-[#2A3143] flex items-center justify-center z-10">
                  <span className="text-white/50 text-[10px] font-bold">1+</span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#121623] bg-[#67E8F9] flex items-center justify-center z-0">
                  <User size={14} className="text-black/50" />
                </div>
              </div>
              <span className="text-[#4A5570] text-[13px] font-semibold">
                12 Available templates
              </span>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => navigate('/audit/wizard/farm')}
              className="w-full bg-[#BEF264] hover:bg-[#c6f477] text-[#080B10] font-bold text-[16px] py-[18px] rounded-full shadow-[0_4px_25px_rgba(190,242,100,0.15)] transition-all active:scale-[0.98] cursor-pointer"
            >
              Start Farm Audit
            </button>
          </div>

          {/* Business Inspection Card */}
          <div className="bg-[#0F1420]/60 backdrop-blur-2xl border border-white/[0.06] rounded-[32px] p-7 shadow-xl">
            {/* Top Row: Icon & Badge */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-[64px] h-[64px] rounded-[22px] bg-[#67E8F9]/[0.08] border border-[#67E8F9]/[0.15] flex items-center justify-center shrink-0">
                <Store className="text-[#67E8F9]" size={32} strokeWidth={1.5} />
              </div>
              <div className="px-3.5 py-1.5 rounded-full border border-white/10 mt-1">
                <span className="text-[#67E8F9] text-[10px] uppercase font-bold tracking-[0.1em]">
                  RETAIL
                </span>
              </div>
            </div>

            {/* Text Details */}
            <h2 className="text-[26px] font-semibold text-white tracking-tight mb-3">
              Business Inspection
            </h2>
            <p className="text-[#6D7A94] text-[15px] leading-relaxed mb-8 font-medium pr-4">
              Standard compliance audit for retail locations, focusing on inventory, safety protocols, and operational standards.
            </p>

            {/* Avatars & Stats */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-[#121623] bg-gradient-to-tr from-orange-200 to-amber-400 overflow-hidden z-20" >
                   {/* Mock User Avatar via CSS Gradient/Emoji for simplicity over loading assets */}
                   <img src="https://i.pravatar.cc/100?img=11" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#121623] bg-[#22353E] flex items-center justify-center z-10">
                  <span className="text-[#67E8F9] text-[10px] font-bold">AJ</span>
                </div>
              </div>
              <span className="text-[#4A5570] text-[13px] font-semibold">
                8 Standard protocols
              </span>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => navigate('/audit/wizard/business')}
              className="w-full bg-[#67E8F9] hover:bg-[#5ce5f6] text-[#080B10] font-bold text-[16px] py-[18px] rounded-full shadow-[0_4px_25px_rgba(77,208,225,0.15)] transition-all active:scale-[0.98] cursor-pointer"
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
