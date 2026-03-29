import { useNavigate } from 'react-router-dom';
import NeonButton from '../components/ui/NeonButton';
import NuruOSLogo from '../components/ui/NuruOSLogo';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-bg-deep">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -left-[20%] -top-[10%] h-[60%] w-[80%] rounded-full bg-neon-lime/5 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-[10%] -right-[20%] h-[50%] w-[70%] rounded-full bg-neon-cyan/5 blur-[140px]" />

      {/* Main content */}
      <div className="z-10 flex flex-1 flex-col items-center justify-center px-10 pt-20">
        {/* Logo block */}
        <div className="relative mb-16">
          {/* Soft glow behind */}
          <div className="absolute -z-10 inset-0 translate-y-2 rounded-[32px] bg-neon-lime/5 blur-2xl" />

          <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/5 bg-bg-card">
            <div style={{ filter: 'drop-shadow(0 0 8px rgba(190,242,100,0.3))' }}>
              <NuruOSLogo size={56} color="white" bgColor="#111622" showRing={false} />
            </div>
          </div>
        </div>

        {/* Brand text */}
        <h1 className="font-sora text-[44px] font-light tracking-tight text-white">
          Nuru<span className="text-glow-lime text-neon-lime">OS</span>
        </h1>
        <p className="mt-3 text-center font-manrope text-lg">
          <span className="font-medium text-white">Smarter Field Audits.</span>
          <br />
          <span className="font-normal text-white/60">Powered by AI.</span>
        </p>
      </div>

      {/* CTA section */}
      <div className="z-10 flex w-full max-w-md flex-col gap-5 px-10 pb-20">
        <NeonButton
          variant="lime"
          size="lg"
          fullWidth
          icon="arrow_forward"
          onClick={() => navigate('/signup')}
        >
          GET STARTED
        </NeonButton>

        <button
          onClick={() => navigate('/signin')}
          className="flex h-[68px] w-full items-center justify-center rounded-full border border-neon-cyan/30 font-manrope text-sm font-semibold uppercase tracking-[0.15em] text-white transition-all duration-200 active:scale-95"
          style={{
            background: 'rgba(11,15,25,0.4)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          SIGN IN
        </button>

        {/* Home indicator */}
        <div className="mt-10 flex justify-center">
          <div className="h-1.5 w-32 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
