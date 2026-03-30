import React from 'react';
import { Check, ChevronDown, AlertCircle, EyeOff, FileText, Calendar, X, Triangle, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessWizard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070A0F] font-base px-6 pt-16 pb-32 overflow-x-hidden relative">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-10 mt-2 px-1 max-w-lg mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-[18px] bg-[#EAEAEA] flex items-center justify-center shrink-0 border border-white/5 shadow-inner cursor-pointer" onClick={() => navigate(-1)}>
            <img src="https://flagcdn.com/w40/kr.png" className="w-[28px] object-contain drop-shadow-md" alt="South Korea" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[26px] font-medium text-white tracking-tight leading-[1.1] mb-1">
              South<br/>Korea
            </h1>
            <p className="text-[#6D7A94] text-[11px] leading-tight">
              12.06.2025 •<br />23.06.2025
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Action Required Pill */}
          <div className="bg-[#FFCC00] text-[#000000] text-[8px] font-extrabold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full text-center leading-[1.2] shadow-[0_0_15px_rgba(255,204,0,0.2)]">
            ACTION<br/>REQUIRED
          </div>

          {/* 30% Progress Cutoff */}
          <div className="relative w-10 h-10 flex items-center justify-center -mr-4 opacity-80">
            <svg className="w-full h-full transform -rotate-90 scale-125" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(190, 242, 100, 0.1)" strokeWidth="3" />
              <circle 
                cx="18" cy="18" r="16" fill="none" 
                stroke="#BEF264" strokeWidth="3" 
                strokeDasharray="100 100" strokeDashoffset="70" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center translate-x-1">
              <span className="text-[9px] font-bold text-[#BEF264] tracking-tighter">30%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto relative">
        {/* Timeline Progress */}
        <div className="flex flex-col relative mb-4">
          {/* Connecting Vertical Line */}
          <div className="absolute left-[15.5px] top-6 bottom-16 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent z-0" />

          {/* Step 1 */}
          <div className="flex items-center justify-between relative z-10 mb-6 group select-none">
            <div className="flex items-center gap-4">
              <div className="w-[32px] h-[32px] rounded-full bg-[#BEF264] flex items-center justify-center shrink-0 border-[3px] border-[#070A0F]">
                <Check size={16} strokeWidth={3} className="text-[#070A0F]" />
              </div>
              <div className="flex flex-col py-1">
                <h3 className="text-[14px] text-white font-medium tracking-tight">Identity & Birth Details</h3>
                <p className="text-[#6D7A94] text-[9px] font-bold tracking-[0.15em] uppercase mt-0.5">STEP 1 • COMPLETE</p>
              </div>
            </div>
            <ChevronDown size={16} className="text-[#6D7A94] opacity-50" />
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between relative z-10 mb-6 group select-none">
            <div className="flex items-center gap-4">
              <div className="w-[32px] h-[32px] rounded-full bg-[#BEF264] flex items-center justify-center shrink-0 border-[3px] border-[#070A0F]">
                <Check size={16} strokeWidth={3} className="text-[#070A0F]" />
              </div>
              <div className="flex flex-col py-1">
                <h3 className="text-[14px] text-white font-medium tracking-tight">Personal Details</h3>
                <p className="text-[#6D7A94] text-[9px] font-bold tracking-[0.15em] uppercase mt-0.5">STEP 2 • COMPLETE</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative text-[#6D7A94]">
                <FileText size={16} strokeWidth={2} />
                <div className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] bg-[#BEF264] text-[#070A0F] text-[8px] font-extrabold rounded-full flex items-center justify-center border border-[#070A0F]">2</div>
              </div>
              <ChevronDown size={16} className="text-[#6D7A94] opacity-50 ml-1" />
            </div>
          </div>

          {/* Step 3 Active Error Node */}
          <div className="border border-white/20 rounded-full px-4 py-3.5 relative z-10 bg-transparent flex items-center justify-between mb-8 shadow-[0_0_20px_rgba(255,77,77,0.05)]">
            <div className="flex items-center gap-4">
              <div className="w-[32px] h-[32px] rounded-full bg-[#FF4D4D] flex items-center justify-center shrink-0 border-[3px] border-[#070A0F] shadow-[0_0_15px_rgba(255,77,77,0.5)]">
                <AlertCircle size={16} strokeWidth={2.5} className="text-white" />
              </div>
              <div className="flex flex-col py-0.5">
                <h3 className="text-[14px] text-white font-medium tracking-tight">Passport Information</h3>
                <p className="text-[#FF4D4D] text-[9px] font-bold tracking-[0.15em] uppercase mt-0.5">STEP 3 • ERRORED</p>
              </div>
            </div>
            <EyeOff size={18} className="text-[#6D7A94] opacity-80" />
          </div>
        </div>

        {/* Application Heading Sub-Form Card */}
        <div className="bg-[#121623] border border-white/5 rounded-[32px] p-6 pb-[90px] relative shadow-2xl overflow-hidden w-full">
          
          <div className="flex items-start justify-between mb-8 pt-2">
            <h2 className="text-[22px] font-medium text-white tracking-tight leading-snug">
              Application<br/>Heading
            </h2>
            <div className="flex items-center gap-1.5 text-[#FF4D4D] bg-[#FF4D4D]/10 px-2 py-1 rounded-[6px]">
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase translate-y-[0.5px]">DECLINED</span>
              <AlertCircle size={12} strokeWidth={2.5} />
            </div>
          </div>

          {/* Form Fields */}
          {/* DOB */}
          <div className="mb-5">
            <label className="text-[#6D7A94] text-[9px] font-bold tracking-[0.15em] uppercase block mb-2.5 px-1">
              Date of Birth
            </label>
            <div className="h-[52px] bg-[#1A1F2E] rounded-[16px] px-4 flex items-center justify-between border border-transparent">
              <span className="text-[#E0E5F0] text-[14px]">03.04.1993</span>
              <Calendar size={18} className="text-[#6D7A94]" />
            </div>
          </div>

          {/* Nationality */}
          <div className="mb-5">
            <label className="text-[#6D7A94] text-[9px] font-bold tracking-[0.15em] uppercase block mb-2.5 px-1">
              Nationality
            </label>
            <div className="h-[52px] bg-[#1A1F2E] rounded-[16px] px-4 flex items-center justify-between border border-transparent">
              <span className="text-[#E0E5F0] text-[14px]">Kazakhstan</span>
              <ChevronDown size={18} className="text-[#6D7A94]" />
            </div>
          </div>

          {/* Home Address */}
          <div className="mb-6">
            <label className="text-[#6D7A94] text-[9px] font-bold tracking-[0.15em] uppercase block mb-2.5 px-1">
              Home Address
            </label>
            <div className="bg-[#1A1F2E] rounded-[16px] px-4 pt-4 pb-5 border border-transparent">
              <p className="text-[#E0E5F0] text-[14px] leading-relaxed">
                Ul. Pushkina 15, kv. 42, Almaty<br/>
                050000, Kazakhstan
              </p>
            </div>
          </div>

          {/* Upload Document Section */}
          <div className="mb-7 mt-2">
            <label className="text-[#6D7A94] text-[9px] font-bold tracking-[0.15em] uppercase block mb-3 px-1">
              Upload Scanned Passport (First Page)
            </label>
            
            {/* Errored Input Focus */}
            <div className="h-[52px] border border-[#FF4D4D] rounded-[26px] px-5 flex items-center justify-between bg-transparent mb-5 shadow-[0_0_20px_rgba(255,77,77,0.08)]">
              <span className="text-[#E0E5F0] text-[13px] tracking-wide truncate pr-4">passport_maria_kz.pdf</span>
              <div className="w-[22px] h-[22px] shrink-0 rounded-full bg-[#FF4D4D] flex items-center justify-center text-white cursor-pointer shadow-md">
                <X size={12} strokeWidth={3} />
              </div>
            </div>

            {/* Error Message Text */}
            <div className="flex items-start gap-2.5 mb-7 px-1.5">
              <AlertCircle size={14} className="text-[#FF4D4D] shrink-0 mt-[1.5px]" strokeWidth={2.5} />
              <p className="text-[#FF4D4D] text-[11px] leading-relaxed tracking-wide opacity-90 pr-2">
                Oops! We couldn't read your file. It might be blurry or missing some details. Please try again with a clearer image.
              </p>
            </div>

            {/* Declined File History Card */}
            <div className="bg-[#1A1F2E] rounded-[16px] p-4 flex items-center gap-4 mx-1">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#4A5570]/20 border border-white/5 flex items-center justify-center shrink-0">
                 {/* Decorative Red Passport SVG */}
                 <div className="w-[20px] h-[26px] bg-[#421A20] rounded-sm flex items-center justify-center border border-[#FFCC00]/20 shadow-sm relative overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full border-[1.5px] border-[#FFCC00]/70 absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="w-3 h-[1px] bg-[#FFCC00]/40 absolute bottom-2 left-1/2 -translate-x-1/2" />
                 </div>
              </div>
              
              <div className="flex flex-col justify-center gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E5F0] text-[13px] font-medium tracking-tight truncate max-w-[110px]">passport_maria_kz</span>
                  <span className="px-1.5 py-0.5 rounded-[4px] bg-white/10 flex items-center justify-center text-white/50 text-[7px] font-extrabold uppercase mt-[1px]">PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6D7A94] text-[10px]">12.10.2025 • 4.3MB</span>
                </div>
                {/* Tiny Declined Badge */}
                <div className="flex items-center gap-1.5 text-white mt-0.5">
                  <span className="text-[9px] font-bold tracking-[0.1em] uppercase">DECLINED</span>
                  <Triangle size={8} fill="currentColor" strokeWidth={0} className="text-white transform -translate-y-[0.5px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-2">
            <label className="text-[#4A5570] text-[9px] font-bold tracking-[0.15em] uppercase block mb-2.5 px-1">
              Full Name (As In Passport)
            </label>
            <div className="h-[52px] bg-[#151924] rounded-[16px] px-4 flex items-center border border-white/5 opacity-60">
              <span className="text-[#6D7A94] text-[14px]">Maria Volkova</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Scroll Down Overlay Action Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-8 flex justify-center pointer-events-none">
        <button className="bg-[#BEF264] text-[#080B10] px-8 py-3.5 rounded-full flex items-center justify-center gap-3 font-extrabold text-[10px] tracking-[0.2em] shadow-[0_4px_40px_rgba(190,242,100,0.4)] pointer-events-auto cursor-pointer hover:bg-[#cbf478] transition-colors">
          <span className="translate-y-[1px]">SCROLL DOWN</span>
          <ArrowDown size={14} strokeWidth={2.5} />
        </button>
      </div>

    </div>
  );
};

export default BusinessWizard;
