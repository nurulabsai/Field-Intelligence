import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, BarChart2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070A0F] flex flex-col font-base items-center overflow-y-auto w-full px-6 pt-16 pb-12 relative text-white">
      
      <div className="w-full max-w-[360px] flex flex-col relative z-10 w-full mb-8">
        {/* App Logo Icon */}
        <div className="w-[52px] h-[52px] rounded-[16px] bg-[#121623] border border-white/5 flex items-center justify-center mb-6 shadow-xl">
          <div className="text-accent">
            <BarChart2 size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Welcome Headers */}
        <h1 className="text-[34px] font-normal text-white font-heading tracking-tight mb-2 leading-tight">
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
        <form onSubmit={handleSubmit} className="bg-[#121623] rounded-[32px] border border-white/[0.04] p-6 pt-8 pb-10 w-full flex flex-col shadow-2xl">
          
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
                className="w-full h-[54px] bg-[#0B0F19] border border-white/[0.04] rounded-[16px] pl-5 pr-12 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light"
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
                className="w-full h-[54px] bg-[#0B0F19] border border-white/[0.04] rounded-[16px] pl-5 pr-12 text-white text-[17px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 tracking-[0.2em]"
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

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button type="button" className="flex items-center justify-center gap-2.5 h-[50px] rounded-full border border-white/[0.04] bg-[#0B0F19] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50">
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              </div>
              <span className="text-white text-[13px] font-semibold pr-1">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2.5 h-[50px] rounded-full border border-white/[0.04] bg-[#0B0F19] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50">
              <span className="font-bold text-white tracking-widest text-[14px]">iOS</span>
              <span className="text-white text-[13px] font-semibold pr-1">Apple ID</span>
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
