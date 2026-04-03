import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon';

const CameraScanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06080C] flex flex-col font-base relative overflow-hidden text-white w-full">
      
      {/* Top Floating Action Pill */}
      <div className="absolute top-12 left-0 right-0 px-6 flex justify-center z-10 w-full">
        <div className="bg-[#0B0F19] border border-white/5 rounded-full h-[54px] w-full max-w-[340px] flex items-center justify-between px-2 shadow-2xl">
          
          {/* Back Action */}
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-white/5 transition-colors text-white hover:text-white"
          >
            <MaterialIcon name="chevron_left" size={20} className="mr-0.5" />
          </button>

          {/* Center Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#67E8F9] shadow-[0_0_8px_rgba(103,232,249,0.8)] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.15em] text-white/90">
              AI SCANNING
            </span>
          </div>

          {/* Right Tools */}
          <div className="flex items-center">
            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-white/5 text-white/70 hover:text-white transition-colors">
              <MaterialIcon name="bolt" size={18} className="ml-0.5" fill />
            </button>
            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-white/5 text-white/70 hover:text-white transition-colors">
              <MaterialIcon name="grid_on" size={18} />
            </button>
          </div>
        
        </div>
      </div>

      {/* Center Viewfinder Graticule void */}
      <div className="flex-1 w-full relative flex items-center justify-center pointer-events-none">
        {/* The Box */}
        <div className="w-[280px] h-[340px] relative">
          {/* Top Left Bracket */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-[1.5px] border-l-[1.5px] border-white/30 rounded-tl-[16px]" />
          {/* Top Right Bracket */}
          <div className="absolute top-0 right-0 w-10 h-10 border-t-[1.5px] border-r-[1.5px] border-white/30 rounded-tr-[16px]" />
          {/* Bottom Left Bracket */}
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[1.5px] border-l-[1.5px] border-white/30 rounded-bl-[16px]" />
          {/* Bottom Right Bracket */}
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[1.5px] border-r-[1.5px] border-white/30 rounded-br-[16px]" />
        </div>
      </div>

      {/* Bottom Control Sheet */}
      <div className="bg-[#121623] rounded-t-[40px] w-full pb-8 pt-8 px-8 flex flex-col items-center z-10">
        
        {/* Segmented Mode Switcher */}
        <div className="bg-[#1D2333] rounded-full flex items-center h-[38px] px-1 mb-10 w-[240px]">
          <button type="button" className="flex-1 h-[32px] rounded-full bg-transparent border-none text-[11px] font-bold tracking-[0.1em] text-[#BEF264] shadow-[0_0_12px_rgba(190,242,100,0.15)] cursor-pointer">
            SCAN
          </button>
          <button type="button" className="flex-1 h-[32px] rounded-full bg-transparent border-none text-[11px] font-bold tracking-[0.1em] text-white/40 cursor-pointer transition-colors hover:text-white/80">
            PHOTO
          </button>
          <button type="button" className="flex-1 h-[32px] rounded-full bg-transparent border-none text-[11px] font-bold tracking-[0.1em] text-white/40 cursor-pointer transition-colors hover:text-white/80">
            VIDEO
          </button>
        </div>

        {/* Action Row */}
        <div className="w-full flex items-center justify-between mb-2 px-2 max-w-[340px]">
          
          {/* Gallery Thumbnail Preview */}
          <button type="button" className="w-[46px] h-[46px] rounded-[14px] bg-[#3B3F63] border border-white/10 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity p-0 flex-shrink-0">
            {/* Blank for structural matching */}
          </button>

          {/* The Massive Shutter Button */}
          <button type="button" className="relative w-[86px] h-[86px] rounded-full bg-transparent p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform border-none outline-none group flex-shrink-0 z-10">
            {/* Outer White Ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-white" />
            {/* Inner Lime Core */}
            <div className="w-[66px] h-[66px] bg-[#BEF264] rounded-full shadow-[0_0_24px_rgba(190,242,100,0.5)] group-hover:bg-[#d0f68d] transition-colors" />
          </button>

          {/* Flip Camera Tool */}
          <button type="button" className="w-[46px] h-[46px] rounded-full bg-[#1A1F2E] border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors flex-shrink-0 text-white">
            <MaterialIcon name="sync" size={18} />
          </button>

        </div>

        {/* iPhone Safe Area Home Bar Mock (or just padding for actual devices) */}
        <div className="w-[130px] h-[5px] rounded-full bg-white/20 mt-8 mb-2" />

      </div>

    </div>
  );
};

export default CameraScanner;
