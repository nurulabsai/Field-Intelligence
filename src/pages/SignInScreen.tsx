import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index';
import FormInput from '../components/ui/FormInput';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';

export default function SignInScreen() {
  const navigate = useNavigate();
  const signIn = useAuthStore(s => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[390px] flex-col overflow-hidden bg-bg-deep">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-neon-cyan/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-neon-lime/5 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pt-16 scrollbar-hide">
        {/* Icon + heading */}
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5">
          <span className="material-symbols-outlined text-white text-[24px]">analytics</span>
        </div>
        <h1 className="mt-4 font-sora text-[40px] font-light leading-tight text-white">
          Welcome Back
        </h1>
        <p className="mt-2 mb-8 font-manrope text-base text-zinc-400">
          Sign in to NuruOS Field Intelligence
        </p>

        {/* Toggle tabs */}
        <div className="mb-8 flex rounded-full bg-white/5 p-1">
          <button
            className="flex-1 rounded-full bg-neon-lime py-2.5 text-center font-manrope text-xs font-bold uppercase tracking-[0.15em] text-black"
            aria-current="page"
          >
            SIGN IN
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="flex-1 rounded-full py-2.5 text-center font-manrope text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 transition-colors hover:text-white"
          >
            SIGN UP
          </button>
        </div>

        {/* Form card */}
        <GlassCard padding="lg" radius="lg">
          <div className="flex flex-col gap-6">
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@nurulabs.io"
              icon="mail"
            />
            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
              icon="lock"
            />

            <div className="flex justify-end">
              <button className="font-manrope text-xs font-semibold text-neon-cyan transition-colors hover:text-neon-cyan/80">
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="flex items-center gap-1 text-xs text-neon-red" role="alert">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {error}
              </p>
            )}

            <NeonButton
              variant="lime"
              fullWidth
              size="lg"
              icon="arrow_forward"
              loading={loading}
              onClick={handleLogin}
            >
              LOGIN
            </NeonButton>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-manrope text-[10px] uppercase tracking-[0.15em] text-white/30">
                Or Continue With
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="glass-card flex items-center justify-center gap-2 rounded-full py-3 font-manrope text-xs font-semibold text-white transition-all active:scale-95"
                aria-label="Sign in with Google"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                className="glass-card flex items-center justify-center gap-2 rounded-full py-3 font-manrope text-xs font-semibold text-white transition-all active:scale-95"
                aria-label="Sign in with Apple"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.14 4.45-3.74 4.25z"/>
                </svg>
                Apple ID
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Footer */}
        <p className="mt-auto pb-6 pt-8 text-center font-manrope text-[10px] text-white/30">
          NuruLabs Field Intel &bull; V2.4.0
        </p>
      </div>
    </div>
  );
}
