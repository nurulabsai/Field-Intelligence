import React, { useState, useCallback } from 'react';
import MaterialIcon from '../../components/MaterialIcon';

interface SignUpFormData {
  full_name: string;
  email: string;
  password: string;
}

interface SignUpScreenProps {
  onSignUp?: (data: SignUpFormData) => Promise<void>;
  onNavigateToLogin?: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigateToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !password) {
      setSubmitError('First name, email, and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setSubmitError(null);
    setLoading(true);

    try {
      await onSignUp?.({
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        password,
      });
      setSubmittedEmail(email.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to create account. Please try again.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, password, confirmPassword, onSignUp]);

  if (submittedEmail) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center font-base overflow-x-hidden relative text-white px-6">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mx-auto mb-6 flex items-center justify-center">
            <MaterialIcon name="mark_email_read" size={32} className="text-accent" />
          </div>
          <h1 className="font-heading text-[32px] font-light tracking-tight text-white mb-3">
            Check your inbox
          </h1>
          <p className="text-white/60 text-[15px] mb-8">
            We sent a confirmation link to{' '}
            <span className="text-white font-medium">{submittedEmail}</span>. Click it to activate
            your account, then sign in.
          </p>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full bg-accent text-black py-4 rounded-full font-bold text-sm uppercase tracking-[0.2em] cursor-pointer border-none active:scale-[0.98] transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-base overflow-x-hidden relative text-white">
      
      {/* Top Header Section */}
      <div className="pt-10 px-6 pb-8 shrink-0">
        <div className="w-full max-w-[480px] mx-auto">
          <button
            onClick={onNavigateToLogin}
            className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center border border-white/5 cursor-pointer hover:bg-white/5 transition-colors text-white"
          >
            <MaterialIcon name="chevron_left" size={18} className="ml-[-1px]" />
          </button>

          <h1 className="text-[36px] font-medium text-white font-heading tracking-tight mt-8 mb-2 leading-tight">
            Create an Account
          </h1>
          <p className="text-white/45 text-[15px] font-medium pr-10">
            Sign up to access NuruOS Field Intelligence tools.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-bg-card/60 backdrop-blur-xl rounded-t-[36px] flex-1 border-t border-white/[0.04] p-6 pt-8 pb-10 flex flex-col items-center">
        
        {/* Animated Segmented Controller */}
        <div className="bg-bg-dark rounded-full flex items-center p-1.5 w-full max-w-[340px] mb-10 shadow-inner">
          <button 
            type="button" 
            onClick={onNavigateToLogin}
            className="flex-1 min-h-11 py-3.5 rounded-full text-[14px] font-medium tracking-wide text-white/50 transition-colors cursor-pointer hover:text-white bg-transparent border-none"
          >
            Sign In
          </button>
          <button
            type="button"
            className="flex-1 min-h-11 py-3.5 rounded-full text-[14px] font-semibold tracking-wide text-bg-primary transition-colors cursor-pointer bg-accent shadow-[0_0_15px_rgba(190,242,100,0.1)] border-none"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex justify-center">
          <div className="w-full max-w-[340px]">
            
            {/* Split Name Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="signup-first-name" className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                  First Name
                </label>
                <input
                  id="signup-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jonathan"
                  className="w-full bg-bg-primary border border-white/[0.04] rounded-[16px] px-5 py-4 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light"
                />
              </div>
              <div>
                <label htmlFor="signup-last-name" className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                  Last Name
                </label>
                <input
                  id="signup-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full bg-bg-primary border border-white/[0.04] rounded-[16px] px-5 py-4 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label htmlFor="signup-email" className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jonathansmith76@gmail.com"
                className="w-full bg-bg-primary border border-white/[0.04] rounded-[16px] px-5 py-4 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label htmlFor="signup-password" className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-bg-primary border border-white/[0.04] rounded-[16px] px-5 py-4 pr-12 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 tracking-[0.2em]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <MaterialIcon name="visibility" size={18} /> : <MaterialIcon name="visibility_off" size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-8">
              <label htmlFor="signup-confirm-password" className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  name="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-bg-primary border border-white/[0.04] rounded-[16px] px-5 py-4 pr-12 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light placeholder:font-light"
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirm}
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1 bg-transparent border-none cursor-pointer"
                >
                  {showConfirm ? <MaterialIcon name="visibility" size={18} /> : <MaterialIcon name="visibility_off" size={18} />}
                </button>
              </div>
            </div>

            {submitError && (
              <div className="mb-6 bg-error/10 border border-error/20 text-error rounded-2xl px-4 py-3 text-sm text-center">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[58px] rounded-full bg-accent text-black text-[13px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(190,242,100,0.2)] transition-transform active:scale-95 disabled:opacity-50 border-none mb-10"
            >
              {loading ? 'Creating...' : 'Register'}
              <MaterialIcon name="arrow_forward" size={18} className="ml-0.5" />
            </button>

            {/* Social Separator */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
              <span className="text-[10px] font-bold tracking-[0.15em] text-text-tertiary uppercase">
                Or Register With
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button type="button" disabled className="flex items-center justify-center gap-2.5 h-[50px] rounded-full border border-white/[0.04] bg-bg-primary transition-colors cursor-not-allowed opacity-50">
                <div className="w-[18px] h-[18px] bg-text-tertiary rounded-[3px] opacity-70" />
                <span className="text-white text-[13px] font-medium pr-1">Google</span>
              </button>
              <button type="button" disabled className="flex items-center justify-center gap-2.5 h-[50px] rounded-full border border-white/[0.04] bg-bg-primary transition-colors cursor-not-allowed opacity-50">
                <div className="w-[18px] h-[18px] bg-gradient-to-tl from-purple-500 to-[#0B0F19] rounded-full flex items-center justify-center p-0.5 opacity-80 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                  <div className="w-full h-full bg-[#121623] rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />
                  </div>
                </div>
                <span className="text-white text-[13px] font-medium pr-1">Apple</span>
              </button>
            </div>
            <p className="text-center text-[10px] text-white/30 -mt-6 mb-6">Social login coming soon</p>

            {/* Bottom Login Link */}
            <p className="text-center text-[13px] text-white/40 mb-2">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={onNavigateToLogin}
                className="bg-transparent border-none p-0 ml-1 text-cyan font-medium hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>

          </div>
        </form>

      </div>
    </div>
  );
};

export default SignUpScreen;
