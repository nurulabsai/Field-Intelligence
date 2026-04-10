import React from 'react';
import MaterialIcon from '../../components/MaterialIcon';
interface StepItem {
  label: string;
  subtitle: string;
  status: 'complete' | 'error' | 'pending';
  docCount?: number;
}

const STEPS: StepItem[] = [
  { label: 'Identity & Birth Details', subtitle: 'Step 1 • Complete', status: 'complete' },
  { label: 'Personal Details', subtitle: 'Step 2 • Complete', status: 'complete', docCount: 2 },
  { label: 'Passport Information', subtitle: 'Step 3 • Errored', status: 'error' },
];

const AuditErrorState: React.FC = () => {

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-base overflow-x-hidden relative">
      <div className="flex-1 overflow-y-auto px-6 pt-14 pb-40">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-2xl bg-bg-card flex items-center justify-center shrink-0">
              <MaterialIcon name="flag" size={28} className="text-text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white tracking-tight font-heading">South Korea</h1>
              <p className="text-[13px] font-medium text-white/40 mt-1">12.06.2025 • 23.06.2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-warning px-4 py-1.5 rounded-full">
              <span className="text-[9px] font-bold text-black uppercase tracking-[0.1em] block leading-none">
                Action Required
              </span>
            </div>
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full p-1" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(190,242,100,0.15)" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke="#BEF264" strokeWidth="3"
                  strokeDasharray="125.6" strokeDashoffset="87.9"
                  strokeLinecap="round"
                  className="origin-center -rotate-90"
                />
              </svg>
              <span className="absolute text-[13px] font-light text-accent font-heading tracking-tight">30%</span>
            </div>
          </div>
        </div>

        {/* Vertical Step Timeline */}
        <div className="space-y-4 relative mb-10 px-2">
          <div className="absolute left-[11px] top-12 bottom-12 w-px bg-white/5" />

          {STEPS.map((step) => {
            if (step.status === 'error') {
              return (
                <div
                  key={step.label}
                  className="flex items-start gap-5 p-6 bg-error/5 rounded-[32px] border border-error/10"
                >
                  <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center z-10 shrink-0 mt-0.5">
                    <MaterialIcon name="warning" size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-white">{step.label}</h3>
                        <p className="text-[10px] text-error uppercase font-bold tracking-widest">{step.subtitle}</p>
                      </div>
                      <MaterialIcon name="visibility_off" size={16} className="text-white/30" />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={step.label} className="flex items-center gap-5 py-2">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center z-10 shrink-0">
                  <MaterialIcon name="check" size={14} className="text-black" />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-white/90">{step.label}</h3>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{step.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.docCount && (
                      <div className="relative">
                        <MaterialIcon name="description" size={18} className="text-white/30" />
                        <span className="absolute -top-1 -right-1 bg-accent text-[8px] text-black font-extrabold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                          {step.docCount}
                        </span>
                      </div>
                    )}
                    <MaterialIcon name="expand_more" size={18} className="text-white/10" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Form Card (glassmorphism) */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-light text-white tracking-tight font-heading">Passport Information</h2>
            <div className="flex items-center text-error gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Declined</span>
              <MaterialIcon name="error" size={16} />
            </div>
          </div>

          <div className="space-y-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Date of birth
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value="03.04.1993"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 text-sm font-medium text-white/90 outline-none"
                />
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Nationality
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value="Kazakhstan"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 text-sm font-medium text-white/90 outline-none"
                />
                <MaterialIcon name="expand_more" size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
            </div>

            {/* Home Address */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Home address
              </label>
              <textarea
                readOnly
                rows={2}
                value="Ul. Pushkina 15, kv. 42, Almaty 050000, Kazakhstan"
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 text-sm font-medium text-white/90 outline-none resize-none"
              />
            </div>

            {/* File Upload Error State */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] ml-1">
                Upload scanned passport (first page)
              </label>

              {/* Errored file pill */}
              <div className="flex items-center justify-between bg-error/5 border border-error/20 rounded-full py-4 px-6">
                <span className="text-sm font-medium text-white/90">passport_maria_kz.pdf</span>
                <MaterialIcon name="cancel" size={20} className="text-error cursor-pointer" />
              </div>

              {/* Error message box */}
              <div className="flex items-start gap-3 bg-error/10 p-5 rounded-3xl">
                <MaterialIcon name="error" size={18} className="text-error mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed text-error font-medium">
                  Oops! We couldn&apos;t read your file. It might be blurry or missing some details. Please try again with a clearer image.
                </p>
              </div>

              {/* File info card */}
              <div className="flex items-center bg-white/[0.03] p-5 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                  <MaterialIcon name="description" size={20} className="text-white/40" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/80">passport_maria_kz</span>
                    <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-md font-bold text-white/40 uppercase tracking-tighter">
                      pdf
                    </span>
                  </div>
                  <p className="text-[10px] text-white/20 font-medium mt-0.5">12.10.2025 • 4.3MB</p>
                  <div className="flex items-center gap-1 text-error/60 mt-1">
                    <span className="text-[8px] font-bold uppercase tracking-widest">Declined</span>
                    <MaterialIcon name="warning" size={10} />
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Full name (as in passport)
              </label>
              <input
                type="text"
                readOnly
                value="Maria Volkova"
                className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-4 px-5 text-sm font-medium text-white/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll Down CTA */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="bg-accent text-black py-4 px-10 rounded-full flex items-center gap-4 shadow-[0_12px_40px_-10px_rgba(190,242,100,0.4)] active:scale-95 transition-all cursor-pointer border-none"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll down</span>
          <MaterialIcon name="arrow_downward" size={16} />
        </button>
      </div>
    </div>
  );
};

export default AuditErrorState;
