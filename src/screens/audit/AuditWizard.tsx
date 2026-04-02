import React, { useState } from 'react';
import { Flag, AlertTriangle, ChevronUp, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../design-system';

interface AuditWizardProps {
  auditId?: string;
  onComplete?: (data: Record<string, unknown>) => void;
}

const DESTINATIONS = ['Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD'];
const PURPOSES = ['Conference', 'Visiting relatives', 'Tourism', 'Study'];

const AuditWizard: React.FC<AuditWizardProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  // -- Fully Wired Form State --
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [primaryDestination, setPrimaryDestination] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);
  const [hasInvitation, setHasInvitation] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSelectDestination = (dest: string) => {
    setPrimaryDestination(dest);
    setDropdownOpen(false);
  };

  const handleNext = async () => {
    if (!primaryDestination || !purpose) return;
    setSubmitting(true);
    try {
      await onComplete?.({
        primaryDestination,
        purpose,
        hasInvitation: hasInvitation === 'Yes',
        additionalNotes,
      });
    } catch {
      // Error handled by wrapper
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = !!primaryDestination && !!purpose;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col p-5 pb-8 font-base overflow-x-hidden relative">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#151924] flex items-center justify-center shrink-0 border border-white/5">
            <Flag size={20} className="text-[#67E8F9]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold text-white font-heading tracking-tight leading-none m-0">Australia</h1>
              <div className="px-2.5 py-1 rounded-[6px] bg-accent text-black text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-black/50" />
                In Progress
              </div>
            </div>
            <p className="text-white/40 text-[11px] mt-1.5 leading-tight">
              06.12.2025 →<br />24.01.2026
            </p>
          </div>
        </div>

        {/* 85% Circular Progress */}
        <div className="relative w-[46px] h-[46px] shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(190, 242, 100, 0.15)" strokeWidth="3" />
            <circle 
              cx="18" cy="18" r="16" fill="none" 
              stroke="#BEF264" strokeWidth="3" 
              strokeDasharray="100 100" strokeDashoffset="15" 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent">85%</span>
          </div>
        </div>
      </div>

      {/* Progress Node Bar */}
      <div className="flex items-center justify-between gap-1 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <React.Fragment key={i}>
            <div className="w-[16px] h-[16px] rounded-full bg-accent flex items-center justify-center shrink-0">
              <Check size={10} strokeWidth={4} className="text-black" />
            </div>
            <div className="h-0.5 flex-1 bg-accent min-w-[12px]" />
          </React.Fragment>
        ))}
        {/* Active Node */}
        <div className="w-[20px] h-[20px] rounded-full border-[2px] border-accent flex items-center justify-center shrink-0 p-1 bg-[#0B0F19]">
          <div className="w-full h-full rounded-full bg-accent" />
        </div>
        <div className="h-0.5 flex-1 bg-white/10 min-w-[12px]" />
        {/* Inactive Node */}
        <div className="w-[16px] h-[16px] rounded-full bg-white/10 shrink-0" />
      </div>

      {/* Section Title */}
      <div className="mb-4 pl-1">
        <h3 className="text-[10px] font-bold text-white/45 tracking-[0.15em] uppercase mb-1">Travel Details</h3>
        <h2 className="text-[10px] font-bold text-accent tracking-[0.15em] uppercase mb-4">Step 6 - Primary Destination</h2>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#121623]/60 backdrop-blur-xl rounded-[32px] p-5 pt-7 pb-8 border border-white/[0.03] shadow-lg flex-1 mb-[100px]">
        
        {/* Form Title & Required Tag */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[26px] font-bold text-white font-heading tracking-tight">Purpose of Visit</h2>
          <div className="flex items-center gap-1.5 text-[#EAB308]">
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase">Required</span>
            <AlertTriangle size={14} strokeWidth={2.5} />
          </div>
        </div>

        {/* Primary Destination Dropdown */}
        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-white/40 tracking-[0.1em] uppercase mb-3 pl-1">Primary Destination</h3>
          
          <div className="flex flex-col gap-2 relative">
            {/* Select Button */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "w-full bg-[#0B0F19] rounded-[16px] px-5 py-4 flex items-center justify-between transition-all cursor-pointer border-none text-left",
                dropdownOpen
                  ? "border border-[#67E8F9] shadow-[0_0_15px_rgba(103,232,249,0.1)]"
                  : primaryDestination
                    ? "border border-accent/30 shadow-[0_0_10px_rgba(190,242,100,0.05)]"
                    : "border border-white/5"
              )}
              style={{ border: dropdownOpen ? '1px solid #67E8F9' : primaryDestination ? '1px solid rgba(190,242,100,0.3)' : '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className={cn("text-[14px]", primaryDestination ? "text-white" : "text-white/50")}>
                {primaryDestination || 'Select your primary destination'}
              </span>
              {dropdownOpen ? (
                <ChevronUp size={20} className="text-[#67E8F9]" />
              ) : (
                <ChevronDown size={20} className="text-white/30" />
              )}
            </button>
            
            {/* Dropdown Options */}
            {dropdownOpen && (
              <div className="w-full bg-[#0B0F19] border border-white/5 rounded-[16px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-20">
                {DESTINATIONS.map((dest) => {
                  const isActive = primaryDestination === dest;
                  return (
                    <div 
                      key={dest}
                      onClick={() => handleSelectDestination(dest)}
                      className={cn(
                        "px-5 py-[18px] text-[14px] cursor-pointer border-b border-white/[0.03] transition-colors",
                        isActive
                          ? "bg-[#67E8F9]/10 text-white font-medium"
                          : "text-white/40 hover:bg-white/5"
                      )}
                    >
                      {dest}
                      {isActive && (
                        <span className="float-right">
                          <Check size={16} className="text-[#67E8F9]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Purpose Radio Group — FULLY WIRED */}
        <div className="flex flex-col gap-[22px] px-1 mb-8">
          {PURPOSES.map(opt => {
            const isSelected = purpose === opt;
            return (
              <label 
                key={opt} 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setPurpose(opt)}
              >
                <div className={cn(
                  "w-[22px] h-[22px] rounded-[6px] flex items-center justify-center border transition-colors shrink-0",
                  isSelected ? "bg-accent border-accent shadow-[0_0_12px_rgba(190,242,100,0.3)]" : "border-white/10 bg-transparent group-hover:border-white/20"
                )}>
                  {isSelected && <Check size={14} strokeWidth={3.5} className="text-[#121623]" />}
                </div>
                <span className={cn(
                  "text-[15px] transition-colors",
                  isSelected ? "text-accent font-medium mt-0.5" : "text-white/60 mt-0.5"
                )}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>

        {/* Faded Dashed Separator */}
        <div className="border-t border-dashed border-white/5 mx-1 mb-7" />

        {/* Invitation Letter Question — FULLY WIRED */}
        <div className="px-1 mb-8">
          <p className="text-white/90 text-[14px] leading-relaxed mb-5 pr-8">
            Do you have an invitation letter from a company or organization?
          </p>
          <div className="flex items-center gap-6">
            {['Yes', 'No'].map(opt => {
              const isSelected = hasInvitation === opt;
              return (
                <label 
                  key={opt} 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setHasInvitation(opt)}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-[2px] transition-all p-1 box-border",
                    isSelected ? "border-accent" : "border-white/10 group-hover:border-white/20"
                  )}>
                    {isSelected && <div className="w-full h-full rounded-full bg-accent" />}
                  </div>
                  <span className={cn(
                    "text-[14px] transition-colors font-medium",
                    isSelected ? "text-white" : "text-white/40"
                  )}>
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional Notes Textarea — WIRED TO STATE */}
        <div className="px-1 flex flex-col">
          <h3 className="text-[10px] font-bold text-white/40 tracking-[0.1em] uppercase mb-3">Any Additional Notes (Optional)</h3>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full min-h-[120px] bg-[#0B0F19] border border-white/[0.03] rounded-[16px] p-5 text-white/60 text-[14px] outline-none focus:border-white/10 transition-colors resize-none placeholder:text-white/20 placeholder:italic font-light leading-relaxed"
            placeholder="Provide any details that may support your application..."
          />
        </div>

      </div>

      {/* Floating Action Buttons — WIRED */}
      <div className="fixed bottom-0 left-0 w-full px-5 pb-8 pt-10 flex items-center justify-between bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent pointer-events-none z-50 max-w-[800px] mx-auto right-0">
        
        <button 
          onClick={() => navigate(-1)}
          className="text-white/40 text-[12px] font-bold tracking-widest uppercase flex items-center gap-1.5 hover:text-white transition-colors pointer-events-auto bg-transparent border-none cursor-pointer p-2"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Back
        </button>
        
        <button 
          onClick={handleNext}
          disabled={!isFormValid || submitting}
          className={cn(
            "h-[52px] px-8 rounded-full text-[13px] font-bold tracking-[0.1em] uppercase flex items-center gap-1.5 cursor-pointer transition-all pointer-events-auto border-none",
            isFormValid 
              ? "bg-accent text-black shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:scale-105 active:scale-95" 
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          {submitting ? 'Submitting...' : 'Next'}
          <ChevronRight size={18} strokeWidth={3} className="ml-1" />
        </button>

      </div>

    </div>
  );
};

export default AuditWizard;
