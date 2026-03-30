import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, ChevronDown, User, Mail, Lock, Building2, ShieldCheck } from 'lucide-react';

interface SignUpFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
  organization: string;
}

interface SignUpScreenProps {
  onSignUp?: (data: SignUpFormData) => Promise<void>;
  onNavigateToLogin?: () => void;
}

const ROLES = ['Field Agent', 'Supervisor', 'Analyst', 'Government', 'DFI'];

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: 'transparent', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'var(--color-error)', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: 'var(--color-warning)', width: '66%' };
  return { label: 'Strong', color: 'var(--color-success)', width: '100%' };
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigateToLogin }) => {
  const [form, setForm] = useState<SignUpFormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: '',
    organization: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);

  const handleChange = useCallback((field: keyof SignUpFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Partial<Record<keyof SignUpFormData, string>> = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.confirm_password) errs.confirm_password = 'Please confirm your password';
    else if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    if (!form.role) errs.role = 'Please select a role';
    if (!form.organization.trim()) errs.organization = 'Organization is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    setLoading(true);
    try {
      await onSignUp?.(form);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to create account. Please try again.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }, [form, validate, onSignUp]);

  const strength = getPasswordStrength(form.password);

  const inputClasses = (hasError: boolean) =>
    `w-full py-3 px-4 pl-11 nuru-glass-card border rounded-full text-white text-[0.938rem] font-[inherit] outline-none transition-colors duration-150 ${hasError ? 'border-error' : 'border-border'}`;

  const formContent = (
    <form onSubmit={handleSubmit} className="w-full max-w-[420px]">
      <div className="mb-8">
        <h2 className="text-[2rem] font-light text-white mb-2 font-heading tracking-tight">
          Create Account
        </h2>
        <p className="text-text-tertiary text-[0.938rem]">
          Start your field intelligence journey
        </p>
      </div>

      {/* Full Name */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><User size={18} /></span>
          <input
            type="text"
            value={form.full_name}
            onChange={e => handleChange('full_name', e.target.value)}
            placeholder="Enter your full name"
            className={inputClasses(!!errors.full_name)}
          />
        </div>
        {errors.full_name && <p className="text-xs text-error-light mt-1">{errors.full_name}</p>}
      </div>

      {/* Email */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Mail size={18} /></span>
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            className={inputClasses(!!errors.email)}
          />
        </div>
        {errors.email && <p className="text-xs text-error-light mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Lock size={18} /></span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={e => handleChange('password', e.target.value)}
            placeholder="Minimum 8 characters"
            className={inputClasses(!!errors.password)}
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
        {form.password && (
          <div className="mt-2">
            <div className="h-[3px] bg-border rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-300"
                style={{ width: strength.width, backgroundColor: strength.color }}
              />
            </div>
            <span className="text-xs mt-1 block" style={{ color: strength.color }}>{strength.label}</span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Lock size={18} /></span>
          <input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirm_password}
            onChange={e => handleChange('confirm_password', e.target.value)}
            placeholder="Repeat your password"
            className={inputClasses(!!errors.confirm_password)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-text-tertiary cursor-pointer p-1"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirm_password && <p className="text-xs text-error-light mt-1">{errors.confirm_password}</p>}
      </div>

      {/* Role Selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><ShieldCheck size={18} /></span>
          <button
            type="button"
            onClick={() => setRoleOpen(p => !p)}
            className={`${inputClasses(!!errors.role)} text-left cursor-pointer flex items-center justify-between pr-10`}
          >
            <span className={form.role ? 'text-white' : 'text-text-tertiary'}>
              {form.role || 'Select your role'}
            </span>
            <ChevronDown size={18} className="absolute right-3.5 text-text-tertiary" />
          </button>
          {roleOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 nuru-glass-card border border-white/10 rounded-[20px] z-50 overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { handleChange('role', role); setRoleOpen(false); }}
                  className={`w-full py-3 px-4 border-none text-[0.938rem] text-left cursor-pointer font-[inherit] transition-colors duration-150 ${form.role === role ? 'bg-accent/15 text-text-accent' : 'text-white bg-transparent hover:bg-white/5'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.role && <p className="text-xs text-error-light mt-1">{errors.role}</p>}
      </div>

      {/* Organization */}
      <div className="mb-7">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Organization</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Building2 size={18} /></span>
          <input
            type="text"
            value={form.organization}
            onChange={e => handleChange('organization', e.target.value)}
            placeholder="Your organization name"
            className={inputClasses(!!errors.organization)}
          />
        </div>
        {errors.organization && <p className="text-xs text-error-light mt-1">{errors.organization}</p>}
      </div>

      {/* Submit */}
      {submitError && (
        <div className="mb-3 rounded-[14px] border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error-light">
          {submitError}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3.5 border-none rounded-full text-base font-semibold tracking-[0.06em] font-[inherit] transition-all duration-150 flex items-center justify-center gap-2 ${loading ? 'bg-accent/60 text-black cursor-not-allowed' : 'bg-accent text-black cursor-pointer shadow-[0_10px_28px_-12px_rgba(190,242,100,0.5)]'}`}
      >
        {loading ? (
          <>
            <span className="w-[18px] h-[18px] border-2 border-black/30 border-t-black rounded-full animate-[nuru-spin_0.6s_linear_infinite]" />
            Creating Account...
          </>
        ) : (
          'Create New Account'
        )}
      </button>

      <p className="text-center mt-6 text-sm text-text-tertiary">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="bg-transparent border-none text-text-accent cursor-pointer font-semibold text-sm font-[inherit] no-underline"
        >
          Login
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
    <div className="min-h-screen flex nuru-screen font-base">
      {/* Left Panel - Desktop Only */}
      <div
        className="nuru-signup-left-panel basis-[45%] shrink-0 grow-0 bg-[linear-gradient(135deg,#111622_0%,#0B0F19_50%,rgba(190,242,100,0.08)_100%)] flex flex-col items-center justify-center p-12 relative overflow-hidden border-r border-border-glass"
      >
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(190,242,100,0.12)_0%,transparent_70%)] top-[20%] -left-[10%]" />
        <div className="relative z-[1] text-center">
          <div className="flex items-baseline justify-center gap-0.5 mb-3">
            <span className="text-[2.5rem] font-bold text-white tracking-[-0.03em]">NuruOS</span>
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          </div>
          <p className="text-text-secondary text-lg leading-relaxed max-w-[340px]">
            Smarter Field Audits.<br />Powered by AI.
          </p>
          <div className="mt-12 p-6 nuru-glass-card rounded-2xl border border-border-glass max-w-[300px]">
            <p className="text-text-secondary text-sm italic leading-relaxed">
              "NuruOS transformed how we collect field data across Tanzania. The AI insights save us hours every week."
            </p>
            <p className="text-text-tertiary text-xs mt-3">
              - Agricultural Extension Officer, Dodoma
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center py-8 px-6 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="nuru-signup-mobile-logo hidden mb-8 text-center">
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
          .nuru-signup-left-panel { display: none !important; }
          .nuru-signup-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default SignUpScreen;
