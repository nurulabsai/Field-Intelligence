import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginScreenProps {
  onLogin?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  onNavigateToSignUp?: () => void;
  onForgotPassword?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigateToSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onLogin?.({ email, password, rememberMe });
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, validate, onLogin]);

  const formContent = (
    <form onSubmit={handleSubmit} className="w-full max-w-[420px]">
      <div className="mb-8">
        <h2 className="text-[1.75rem] font-bold text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-text-tertiary text-[0.938rem]">
          Sign in to continue your field audits
        </p>
      </div>

      {/* Email */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Mail size={18} /></span>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
            placeholder="you@example.com"
            className={`w-full min-h-[48px] py-3 px-4 pl-11 bg-bg-input border rounded-xl text-white text-[0.938rem] font-[inherit] outline-none transition-colors duration-150 ${errors.email ? 'border-error' : 'border-border'}`}
          />
        </div>
        {errors.email && <p className="text-xs text-error-light mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Lock size={18} /></span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
            placeholder="Enter your password"
            className={`w-full min-h-[48px] py-3 px-4 pl-11 bg-bg-input border rounded-xl text-white text-[0.938rem] font-[inherit] outline-none transition-colors duration-150 ${errors.password ? 'border-error' : 'border-border'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-text-tertiary cursor-pointer p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-error-light mt-1">{errors.password}</p>}
      </div>

      {/* Remember + Forgot */}
      <div className="flex justify-between items-center mb-7">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setRememberMe(p => !p)}
            className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-all duration-150 shrink-0 ${rememberMe ? 'border-accent bg-accent' : 'border-white/20 bg-transparent'}`}
          >
            {rememberMe && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-text-secondary">Remember Me</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="bg-transparent border-none text-text-accent text-sm font-medium cursor-pointer font-[inherit] min-h-[44px] flex items-center"
        >
          Forgot Password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full min-h-[48px] py-3 border-none rounded-xl text-base font-semibold font-[inherit] transition-colors duration-150 flex items-center justify-center gap-2 ${loading ? 'bg-accent/60 text-black cursor-not-allowed' : 'bg-accent text-black cursor-pointer'}`}
      >
        {loading ? (
          <>
            <span className="w-[18px] h-[18px] border-2 border-black/30 border-t-black rounded-full animate-[nuru-spin_0.6s_linear_infinite]" />
            Signing in...
          </>
        ) : (
          'Login'
        )}
      </button>

      <p className="text-center mt-6 text-sm text-text-tertiary">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToSignUp}
          className="bg-transparent border-none text-text-accent cursor-pointer font-semibold text-sm font-[inherit] min-h-[44px] inline-flex items-center"
        >
          Sign up
        </button>
      </p>

      <style>{`
        @keyframes nuru-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );

  return (
    <div className="min-h-screen flex bg-bg-primary font-base">
      {/* Left Panel - Desktop Only */}
      <div
        className="nuru-login-left-panel basis-[45%] shrink-0 grow-0 bg-[linear-gradient(135deg,#111622_0%,#0B0F19_50%,rgba(190,242,100,0.08)_100%)] flex flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(190,242,100,0.1)_0%,transparent_70%)] bottom-[10%] -right-[5%]" />
        <div className="relative z-[1] text-center">
          <div className="flex items-baseline justify-center gap-0.5 mb-3">
            <span className="text-[2.5rem] font-bold text-white tracking-[-0.03em]">NuruOS</span>
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          </div>
          <p className="text-text-secondary text-lg leading-relaxed max-w-[340px]">
            Smarter Field Audits.<br />Powered by AI.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-[320px]">
            {[
              { value: '2,400+', label: 'Farms Audited' },
              { value: '15', label: 'Regions Covered' },
              { value: '98%', label: 'Data Accuracy' },
              { value: '50+', label: 'Active Agents' },
            ].map(stat => (
              <div
                key={stat.label}
                className="p-4 bg-bg-glass backdrop-blur-[var(--glass-blur)] rounded-xl border border-border-glass text-center"
              >
                <div className="text-xl font-bold text-text-accent">{stat.value}</div>
                <div className="text-xs text-text-tertiary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center py-8 px-6">
        <div className="w-full max-w-[420px]">
          <div className="nuru-login-mobile-logo hidden mb-8 text-center">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-[1.75rem] font-bold text-white">NuruOS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </div>
          </div>
          {formContent}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nuru-login-left-panel { display: none !important; }
          .nuru-login-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
