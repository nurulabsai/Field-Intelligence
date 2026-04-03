import React, { useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import NuruLogo from '../../components/NuruLogo';

interface LoginScreenProps {
  onLogin?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  onNavigateToSignUp?: () => void;
  onForgotPassword?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigateToSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('admin@nurulabs.io');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (onLogin) {
        const finalPassword = password === '••••••••••••' ? 'password' : password;
        await onLogin({ email, password: finalPassword, rememberMe: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-base items-center overflow-y-auto w-full relative text-white">

      {/* Ambient Gradient Orbs — Stitch spec */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-cyan/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <main className="flex-1 flex flex-col px-6 pt-16 z-10 w-full max-w-[390px]">
        {/* App Logo Icon — Stitch spec: w-12 h-12 rounded-2xl */}
        <div className="mb-8 px-2">
          <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <NuruLogo size={24} color="#BEF264" />
          </div>

          {/* Welcome Headers — Stitch spec */}
          <h1 className="text-[40px] font-light tracking-tight font-heading text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-base text-text-tertiary font-base">
            Sign in to NuruOS Field Intelligence
          </p>
        </div>

        {/* Tab Switcher — Stitch spec: bg-white/5 p-1 rounded-full */}
        <div className="bg-white/5 p-1 rounded-full flex mb-8">
          <button
            type="button"
            className="flex-1 py-3 text-sm font-bold rounded-full bg-accent text-black transition-all border-none cursor-pointer uppercase"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="flex-1 py-3 text-sm font-bold rounded-full text-text-tertiary transition-all cursor-pointer bg-transparent border-none uppercase"
          >
            Sign Up
          </button>
        </div>

        {/* Main Login Card — Stitch glassmorphism spec: rounded-[32px] p-8 */}
        <form onSubmit={handleSubmit} className="nuru-glassmorphism rounded-[32px] p-8 space-y-6 w-full">

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.15em] ml-2 font-base">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@nurulabs.io"
                  autoComplete="email"
                  className="w-full bg-bg-primary border border-white/10 rounded-[16px] px-5 py-4 text-white text-sm outline-none transition-all focus:border-cyan focus:ring-1 focus:ring-cyan/30 placeholder:text-white/20 font-base"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  <MaterialIcon name="mail" size={18} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.15em] ml-2 font-base">
                Password
              </label>
              <div className="relative group">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-bg-primary border border-white/10 rounded-[16px] px-5 py-4 text-white text-sm outline-none transition-all focus:border-cyan focus:ring-1 focus:ring-cyan/30 placeholder:text-white/20 font-base"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  <MaterialIcon name="lock" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Forgot Password — Stitch spec */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold text-cyan tracking-wide hover:opacity-80 transition-opacity font-base bg-transparent border-none cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error rounded-2xl px-4 py-3 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          {/* Login Button — Stitch spec: neon-glow-lime */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black py-4 rounded-full font-bold text-sm uppercase tracking-[0.2em] nuru-glow-lime active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-none cursor-pointer"
          >
            {loading ? 'Entering\u2026' : 'Login'}
            <MaterialIcon name="arrow_forward" size={18} />
          </button>

          {/* Social Separator — Stitch spec */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/5" />
            <span className="flex-shrink mx-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-base">
              Or Continue With
            </span>
            <div className="flex-grow border-t border-white/5" />
          </div>

          {/* Social Buttons — Stitch glassmorphism spec */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="nuru-glassmorphism flex items-center justify-center gap-3 py-3.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDh98-cJhfuYqtEkV62K3Uzw6oqB6hVeliRpkKayAW_N8rscM9hQ2BQX3pQSBhL5PoaiZrYD1rlaa39ULz8hTaVA6p6QhiJQ4tEVgdvCVWZvDHsjP-e1jvtwPV06KCfFXgN-HDjaSY3oVUCNgGmI_x-GbVRdm6jf9O0dBUe0oRBAG0ZHq6t429XyWY0K242ZKh5tYDLzgQ-Vb45OjD7buAyBbcOpE8e528lxzFJPJIPOW1dGKDJBob-T6vuvsI9DgwxR10n66glxEJ"
              />
              <span className="text-sm font-bold text-white font-base">Google</span>
            </button>
            <button
              type="button"
              className="nuru-glassmorphism flex items-center justify-center gap-3 py-3.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-sm font-bold text-white font-base">Apple ID</span>
            </button>
          </div>
        </form>

        {/* Bottom link */}
        <div className="mt-8 mb-8 text-center">
          <p className="text-xs text-text-tertiary font-medium font-base">
            Don&apos;t have an account?{' '}
            <button type="button" onClick={onNavigateToSignUp} className="text-cyan font-bold ml-1 hover:underline transition-all bg-transparent border-none cursor-pointer">
              Sign Up
            </button>
          </p>
        </div>
      </main>

      {/* Footer branding — Stitch spec */}
      <footer className="p-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 opacity-30">
          <span className="text-[10px] font-bold tracking-widest text-white uppercase font-base">NuruLabs Field Intel</span>
          <div className="w-1 h-1 bg-white rounded-full" />
          <span className="text-[10px] font-bold tracking-widest text-white font-base">V2.4.0</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginScreen;
