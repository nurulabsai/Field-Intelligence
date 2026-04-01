import React, { useState } from 'react';
import { ArrowRight, Mail, Lock } from 'lucide-react';
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
        // Strip the dots if they didn't actually type a password
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
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-base items-center overflow-y-auto w-full px-6 pt-16 pb-12 relative text-white">
      
      {/* Ambient Gradient Orbs — Stitch spec */}
      <div className="absolute top-[-40px] right-[-60px] w-[280px] h-[280px] bg-[#67E8F9] rounded-full blur-[140px] opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-40px] left-[-60px] w-[260px] h-[260px] bg-[#BEF264] rounded-full blur-[140px] opacity-[0.05] pointer-events-none" />
      
      <div className="w-full max-w-[360px] flex flex-col relative z-10 w-full mb-8">
        {/* App Logo Icon */}
        <div className="w-[52px] h-[52px] rounded-[16px] bg-[#121623] border border-white/5 flex items-center justify-center mb-6 shadow-xl">
          <NuruLogo size={24} />
        </div>

        {/* Welcome Headers */}
        <h1 className="text-[40px] font-normal text-white font-heading tracking-tight mb-2 leading-tight">
          Welcome Back
        </h1>
        <p className="text-white/45 text-[15px] pr-8 mb-8">
          Sign in to NuruOS Field Intelligence
        </p>

        {/* Tab Switcher */}
        <div className="bg-[#121623] border-white/5 rounded-full flex items-center p-[5px] w-full mb-8 shadow-inner">
          <button 
            type="button" 
            className="flex-1 py-3.5 rounded-full text-[14px] font-bold tracking-wide text-[#121623] transition-colors cursor-pointer bg-accent shadow-[0_0_15px_rgba(190,242,100,0.15)] border-none uppercase"
          >
            Sign In
          </button>
          <button 
            type="button" 
            onClick={onNavigateToSignUp}
            className="flex-1 py-3.5 rounded-full text-[14px] font-semibold tracking-wide text-white/40 transition-colors cursor-pointer hover:text-white bg-transparent border-none uppercase"
          >
            Sign Up
          </button>
        </div>

        {/* Main Login Card */}
        <form onSubmit={handleSubmit} className="bg-[#0F1420]/70 backdrop-blur-2xl rounded-[32px] border border-white/[0.06] p-6 pt-8 pb-10 w-full flex flex-col shadow-2xl">
          
          {/* Email Box */}
          <div className="mb-6 w-full">
            <label className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
              Email Address
            </label>
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@nurulabs.io"
                className="w-full h-[54px] bg-[#0B0F19] border border-white/[0.04] rounded-[16px] pl-5 pr-12 text-white text-[15px] outline-none transition-all focus:border-[#67E8F9]/50 focus:shadow-[0_0_12px_rgba(103,232,249,0.1)] placeholder:text-white/20 font-light"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <Mail size={18} />
              </div>
            </div>
          </div>

          {/* Password Box */}
          <div className="mb-2 w-full">
            <label className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
              Password
            </label>
            <div className="relative w-full">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[54px] bg-[#0B0F19] border border-white/[0.04] rounded-[16px] pl-5 pr-12 text-white text-[17px] outline-none transition-all focus:border-[#67E8F9]/50 focus:shadow-[0_0_12px_rgba(103,232,249,0.1)] placeholder:text-white/20 tracking-[0.2em]"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <Lock size={18} />
              </div>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="w-full flex justify-end mb-6">
            <button 
              type="button" 
              onClick={onForgotPassword}
              className="bg-transparent border-none text-[13px] font-medium text-[#67E8F9] hover:underline cursor-pointer pt-2 pb-1"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[12px] px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[56px] rounded-full bg-accent text-[#0B0F19] text-[13px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(190,242,100,0.2)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 border-none mb-10"
          >
            {loading ? 'Entering...' : 'Login'}
            <ArrowRight size={18} strokeWidth={2.5} className="ml-0.5" />
          </button>

          {/* Social Separator */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#181F30]" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#344160] uppercase">
              Or Continue With
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#181F30]" />
          </div>

          {/* Social Buttons — Stitch spec */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button type="button" className="flex items-center justify-center gap-2.5 h-[50px] rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
              <img 
                alt="Google" 
                className="w-5 h-5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDh98-cJhfuYqtEkV62K3Uzw6oqB6hVeliRpkKayAW_N8rscM9hQ2BQX3pQSBhL5PoaiZrYD1rlaa39ULz8hTaVA6p6QhiJQ4tEVgdvCVWZvDHsjP-e1jvtwPV06KCfFXgN-HDjaSY3oVUCNgGmI_x-GbVRdm6jf9O0dBUe0oRBAG0ZHq6t429XyWY0K242ZKh5tYDLzgQ-Vb45OjD7buAyBbcOpE8e528lxzFJPJIPOW1dGKDJBob-T6vuvsI9DgwxR10n66glxEJ" 
              />
              <span className="text-white text-[13px] font-bold">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2.5 h-[50px] rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-white text-[13px] font-bold">Apple ID</span>
            </button>
          </div>

        </form>
      </div>

      <div className="mt-8 mb-4">
        <p className="text-[#344160] text-[10px] font-bold tracking-[0.2em] uppercase">
          NURULABS FIELD INTEL • V2.4.0
        </p>
      </div>

    </div>
  );
};

export default LoginScreen;
