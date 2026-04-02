import React, { useState, useCallback } from 'react';
import { ChevronLeft, Eye, EyeOff, ArrowRight } from 'lucide-react';

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
        confirm_password: confirmPassword,
        role: 'Field Agent',        // Dummy value since this mockup removes it
        organization: 'NuruOS'      // Dummy value
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to create account. Please try again.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, password, confirmPassword, onSignUp]);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-base overflow-x-hidden relative text-white">
      
      {/* Top Header Section */}
      <div className="pt-10 px-6 pb-8 shrink-0">
        <button 
          onClick={onNavigateToLogin}
          className="w-10 h-10 rounded-full bg-[#1A1F2E] flex items-center justify-center border border-white/5 cursor-pointer hover:bg-white/5 transition-colors text-white"
        >
          <ChevronLeft size={18} strokeWidth={2.5} className="ml-[-1px]" />
        </button>

        <h1 className="text-[36px] font-medium text-white font-heading tracking-tight mt-8 mb-2 leading-tight">
          Create an Account
        </h1>
        <p className="text-white/45 text-[15px] font-medium pr-10">
          Sign up to access NuruOS Field Intelligence tools.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#121623]/60 backdrop-blur-xl rounded-t-[36px] flex-1 border-t border-white/[0.04] p-6 pt-8 pb-10 flex flex-col items-center">
        
        {/* Animated Segmented Controller */}
        <div className="bg-[#070A0F] rounded-full flex items-center p-1.5 w-full max-w-[340px] mb-10 shadow-inner">
          <button 
            type="button" 
            onClick={onNavigateToLogin}
            className="flex-1 py-3.5 rounded-full text-[14px] font-medium tracking-wide text-white/50 transition-colors cursor-pointer hover:text-white bg-transparent border-none"
          >
            Sign In
          </button>
          <button 
            type="button" 
            className="flex-1 py-3.5 rounded-full text-[14px] font-semibold tracking-wide text-[#121623] transition-colors cursor-pointer bg-accent shadow-[0_0_15px_rgba(190,242,100,0.1)] border-none"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex justify-center w-full">
          <div className="w-full max-w-[340px]">
            
            {/* Split Name Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jonathan"
                  className="w-full bg-[#0B0F19] border border-white/[0.04] rounded-[16px] px-5 py-4 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full bg-[#0B0F19] border border-white/[0.04] rounded-[16px] px-5 py-4 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jonathansmith76@gmail.com"
                className="w-full bg-[#0B0F19] border border-white/[0.04] rounded-[16px] px-5 py-4 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B0F19] border border-white/[0.04] rounded-[16px] px-5 py-4 pr-12 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 tracking-[0.2em]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-8">
              <label className="block text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-[#0B0F19] border border-white/[0.04] rounded-[16px] px-5 py-4 pr-12 text-white text-[15px] outline-none transition-colors focus:border-white/20 placeholder:text-white/20 font-light placeholder:font-light"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1 bg-transparent border-none cursor-pointer"
                >
                  {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {submitError && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[12px] px-4 py-3 text-sm text-center">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[58px] rounded-full bg-accent text-[#0B0F19] text-[13px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(190,242,100,0.2)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 border-none mb-10"
            >
              {loading ? 'Creating...' : 'Register'}
              <ArrowRight size={18} strokeWidth={2.5} className="ml-0.5" />
            </button>

            {/* Social Separator */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#181F30]" />
              <span className="text-[10px] font-bold tracking-[0.15em] text-[#344160] uppercase">
                Or Register With
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#181F30]" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button type="button" className="flex items-center justify-center gap-2.5 h-[50px] rounded-full border border-white/[0.04] bg-[#0B0F19] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50">
                <div className="w-[18px] h-[18px] bg-[#67718A] rounded-[3px] opacity-70" />
                <span className="text-white text-[13px] font-medium pr-1">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2.5 h-[50px] rounded-full border border-white/[0.04] bg-[#0B0F19] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50">
                {/* Mock Apple glow logo using divs */}
                <div className="w-[18px] h-[18px] bg-gradient-to-tl from-purple-500 to-[#0B0F19] rounded-full flex items-center justify-center p-0.5 opacity-80 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                  <div className="w-full h-full bg-[#121623] rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />
                  </div>
                </div>
                <span className="text-white text-[13px] font-medium pr-1">Apple</span>
              </button>
            </div>

            {/* Bottom Login Link */}
            <p className="text-center text-[13px] text-white/40 mb-2">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={onNavigateToLogin}
                className="bg-transparent border-none p-0 ml-1 text-[#67E8F9] font-medium hover:underline cursor-pointer"
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
