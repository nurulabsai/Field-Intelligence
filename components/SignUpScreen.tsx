import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import './SignUpScreen.css';

interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
}

interface SignUpScreenProps {
  onSignUp: (data: SignUpData) => void;
  onSignIn: () => void;
  loading?: boolean;
  error?: string;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUp,
  onSignIn,
  loading = false,
  error,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateForm = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('First and last name are required');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Valid email is required');
      return false;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSignUp({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        confirmPassword,
        rememberMe: false, // Defaulted per design
      });
    }
  };

  return (
    <ScreenLayout className="overflow-hidden items-center justify-center p-0" withBottomNavOffset={false}>
      <div className="signup-screen text-white overflow-hidden flex flex-col items-center flex-1 h-full w-full">
        <div className="w-full pt-14 pb-10 px-8 flex flex-col relative z-10 shrink-0 max-w-md">
          <button 
            onClick={onSignIn}
            className="w-12 h-12 bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-8 active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} className="mr-1" />
          </button>
          <h1 className="text-4xl font-light tracking-tight text-white mb-3">Create an Account</h1>
          <p className="text-gray-400 text-base font-medium font-sans">Sign up to access NuruOS Field Intelligence tools.</p>
        </div>
      
      <div className="flex-1 w-full glass-card relative rounded-t-[32px] overflow-hidden flex flex-col max-w-md">
        <div className="h-full overflow-y-auto no-scrollbar flex-1 relative z-20">
          <div className="p-8 pb-12">
            
            <div className="bg-black/40 p-1.5 rounded-full flex mb-10 border border-white/5">
              <button 
                onClick={onSignIn}
                className="flex-1 py-3.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors font-sans"
              >
                Sign In
              </button>
              <button className="flex-1 py-3.5 text-sm font-bold text-black bg-[var(--neon-lime)] rounded-full transition-all shadow-lg shadow-[#BEF264]/10 font-sans">
                Sign Up
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-2 font-sans">First Name</label>
                  <input 
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setValidationError(''); }}
                    className="w-full px-5 py-4 rounded-[16px] bg-black/40 border border-white/10 outline-none text-white placeholder-gray-600 transition-all text-sm input-glow font-sans" 
                    placeholder="Jonathan" 
                    required 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-2 font-sans">Last Name</label>
                  <input 
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setValidationError(''); }}
                    className="w-full px-5 py-4 rounded-[16px] bg-black/40 border border-white/10 outline-none text-white placeholder-gray-600 transition-all text-sm input-glow font-sans" 
                    placeholder="Smith" 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-2 font-sans">Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setValidationError(''); }}
                  className="w-full px-5 py-4 rounded-[16px] bg-black/40 border border-white/10 outline-none text-white placeholder-gray-600 transition-all text-sm input-glow font-sans" 
                  placeholder="jonathansmith76@gmail.com" 
                  required 
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-2 font-sans">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setValidationError(''); }}
                    className="w-full px-5 py-4 rounded-[16px] bg-black/40 border border-white/10 outline-none text-white placeholder-gray-600 transition-all text-sm pr-14 input-glow font-sans" 
                    placeholder="Create a password" 
                    required 
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--neon-cyan)] transition-colors"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-2 font-sans">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(''); }}
                    className="w-full px-5 py-4 rounded-[16px] bg-black/40 border border-white/10 outline-none text-white placeholder-gray-600 transition-all text-sm pr-14 input-glow font-sans" 
                    placeholder="Re-enter password" 
                    required 
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--neon-cyan)] transition-colors"
                  >
                    {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {(validationError || error) && (
                <div className="text-red-400 text-sm font-medium mt-2 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  ⚠️ {validationError || error}
                </div>
              )}
              
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[var(--neon-lime)] text-black py-4.5 rounded-full font-bold text-base shadow-xl shadow-[#BEF264]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 h-14 disabled:opacity-70 disabled:active:scale-100"
                >
                  {loading ? 'REGISTERING...' : 'REGISTER'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </div>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                  <span className="px-4 bg-[#0F172A]/80 backdrop-blur-md rounded-full text-gray-500 font-bold font-sans">Or Register With</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pb-6">
                <button type="button" className="social-btn rounded-full flex items-center justify-center gap-3 px-4 py-4 transition-all group h-14">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3gy83Z5l95Hx3VoJyR6Ml1GhmMqFceTfJKT4J8ahmV3BUF-bQtY_6bw60FIyv4ogEXzvBTLUa_cAoiTmaYfMd8a9SE79UiQuweGp1l5VbmyUfOBDUHG7vftLGcYTrCkgfGfAj9HzgM5ynXVCDpSE0MLz0-za0Wo8uSk7XJrdRB9c43kuVulXUSnkwr8lLDj0q6B6pkPYj5rQ2PQwKsQgZxs73Rd5hJIYSFn-JRydfOjv7lZRQAhIbR5yEQ9Gmvp53kLA6PNnVn5hy" alt="Google" className="w-5 h-5 brightness-200 contrast-0 grayscale invert opacity-80 group-hover:opacity-100" />
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white font-sans">Google</span>
                </button>
                <button type="button" className="social-btn rounded-full flex items-center justify-center gap-3 px-4 py-4 transition-all group h-14">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEjRfPsOB2H-lLvnqktujGjk6-z0grVqKvRqBzp77VxP8Ot9grBDu9FDuizQNBJMcyg0gH-rceV5hQGQQ07ExdzzJLJ_Ee611YEnxp_3r1TvE3BeLuB2ZWP_oLwOH3e27nRKj9O6C2rZ_dv2btjYKb-mbUFpBVO31scs83TvI0u_wLzC6NEQc_odgGgmh5yUIkbILKVc5e1OfR7QI2tj91clvtKXU258rwoT6xIuHYB2RsUGYw_i6HiCkUbUwesSW2QEnHdw9_nEcJ" alt="Apple" className="w-5 h-5 invert opacity-80 group-hover:opacity-100" />
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white font-sans">Apple</span>
                </button>
              </div>
              
              <p className="text-center text-xs text-gray-500 font-medium font-sans pb-4">
                Already have an account? 
                <button type="button" onClick={onSignIn} className="text-[var(--neon-cyan)] font-bold ml-1 hover:underline">Sign In</button>
              </p>
            </form>
          </div>
        </div>
      </div>
      </div>
    </ScreenLayout>
  );
};