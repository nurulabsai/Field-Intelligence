import React from 'react';
import './AuditTypeSelector.css';
import { X, Sprout, Store } from 'lucide-react';

interface AuditTypeSelectorProps {
  onSelectType: (type: 'farm' | 'business') => void;
}

export const AuditTypeSelector: React.FC<AuditTypeSelectorProps> = ({
  onSelectType,
}) => {
  return (
    <div className="font-sans text-white min-h-screen flex flex-col bg-[#0B0F19]">
      <div className="w-full max-w-[430px] mx-auto min-h-screen relative">

        {/* Header */}
        <div className="px-8 pt-14 pb-10 flex justify-between items-center">
          <h2 className=" text-[32px] font-light tracking-tight text-white leading-tight">Select Audit Type</h2>
          <button className="w-12 h-12 flex items-center justify-center rounded-full vital-card">
            <X size={22} className="text-slate-400" />
          </button>
        </div>

        {/* Cards Container */}
        <div className="px-8 flex flex-col gap-6 pb-40 overflow-y-auto no-scrollbar">

          {/* Farm Audit Card */}
          <div className="vital-card rounded-[32px] p-8 flex flex-col relative overflow-hidden border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-[20px] bg-[#BEF264]/10 flex items-center justify-center border border-[#BEF264]/20">
                <Sprout size={32} className="text-[#BEF264]" />
              </div>
              <span className="text-[10px] font-bold font-sans uppercase tracking-widest text-[#BEF264] bg-[#BEF264]/10 px-3 py-1 rounded-full border border-[#BEF264]/20">
                Outdoor
              </span>
            </div>
            <h3 className=" font-semibold text-[24px] text-white leading-tight mb-2">Farm Audit</h3>
            <p className="font-sans text-[15px] font-normal text-slate-400 leading-relaxed mb-8 opacity-90">
              Comprehensive assessment of agricultural health, irrigation systems, and soil quality metrics across large terrains.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#0B0F19] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img alt="Auditor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_ay3ORGYN9vPq8rBMXuA4ui9rC2VlmS18ahphGQKkFFgBfKsrjXGchGxFT19eoCmKgmO-3PMuwJaOn9VY_edc8dSUmjzUKMu1PoMpNy63B4ubf8DSxIpVMcEyxFs8PDlODxt7h03uuy_mOOfDBVySvJOqNdfewdu0orp8BBPjHidGQw4QVP9tU8egxjpF3150B_oJKftpof0SaYYGNolvWumbWOYxeIw9xdnofU3pwY1iZ6DuwmdEgQblviFKnH1mm5LEM6gS8NZ_" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0B0F19] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img alt="Auditor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC22f1FbA9Bs4AoHc6MBvCubR0iBoEGfWXM0SExCCI-sCnsDe6eBh0x8aq2E8ltQAs1DxHEO3akMgdttHPGEPndgXGiYoyV9njlvX3u5zZI-HlBgTwnFtiYVu76Nxv23XnAIZgsBmGRu8y3t3oL2MCxIxQtBiYZqKESDFx5r11PFJvh7BuBcZ4m8bZtWEUy8kGJzy8g2n8zYl-8pvWTKNjPH0KQPCDwResGrsjLRtL86B9kT5XtMMUKdjpeOBuszQKbGqgQtAvRLIzq" />
                </div>
              </div>
              <span className="text-xs font-sans text-slate-500">12 Available templates</span>
            </div>
            <button 
              onClick={() => onSelectType('farm')}
              className="w-full bg-[#BEF264] text-black font-bold py-4 rounded-full text-base transition-transform active:scale-[0.98] btn-shadow-lime"
            >
              Start Farm Audit
            </button>
          </div>

          {/* Business Inspection Card */}
          <div className="vital-card rounded-[32px] p-8 flex flex-col relative overflow-hidden border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-[20px] bg-[#67E8F9]/10 flex items-center justify-center border border-[#67E8F9]/20">
                <Store size={32} className="text-[#67E8F9]" />
              </div>
              <span className="text-[10px] font-bold font-sans uppercase tracking-widest text-[#67E8F9] bg-[#67E8F9]/10 px-3 py-1 rounded-full border border-[#67E8F9]/20">
                Retail
              </span>
            </div>
            <h3 className=" font-semibold text-[24px] text-white leading-tight mb-2">Business Inspection</h3>
            <p className="font-sans text-[15px] font-normal text-slate-400 leading-relaxed mb-8 opacity-90">
              Standard compliance audit for retail locations, focusing on inventory, safety protocols, and operational standards.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#0B0F19] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img alt="Auditor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnuLDFXkfDl5RuOIShsMVI70ThnyBDxMJowr6xw4iQNrxoBhSIqc0h_LDy2jBZGM12pyVgwhGwn8R8mldHgEUHM4zPJxK8g7yh0AIcX-jbtYvHGbblEewGQ_54Pzt4kN3yX69G6o4zJvIpEWGhLYKDJRV66HIQmcRKzlTerTK_0JpSEqhhOBmpfPwQDlSfo8BmgR4qb0d1zhlfiIOM-WwVzjdaE8_YGp1bEY11_shV-GpRYAOFVayabMZPmQZvlvsXm_0ip6kwEbLi" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0B0F19] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img alt="Auditor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyGeegDJXfND3Uz-iVmIBy0hVL2NvpsfDBDV3aIK-kOza_qbLhwQkRCX8fHbLtiei95kTpyOmZZIu5BfSi-KVoydaI57mii9nKnFDqpt-p-LPqS-s39hF84P__NPnxnDHPHYxDSoQ8RQ2Pxu3k_llRh-WTQnloXbtVmI1kJK22nFWzkNug2jmLMLRo7O7IM9oVAwcAcvERLd3Oh8ynszWXl01XCK_qTU31emxecqvWWDV_3SY7aMcCaRBPc_uhtGcnpBI7lT_Iz59O" />
                </div>
              </div>
              <span className="text-xs font-sans text-slate-500">8 Standard protocols</span>
            </div>
            <button 
              onClick={() => onSelectType('business')}
              className="w-full bg-[#67E8F9] text-black font-bold py-4 rounded-full text-base transition-transform active:scale-[0.98] btn-shadow-cyan"
            >
              Start Business Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
