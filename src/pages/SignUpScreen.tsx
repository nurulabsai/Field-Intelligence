import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index';
import FormInput from '../components/ui/FormInput';
import NeonButton from '../components/ui/NeonButton';
import NuruOSLogo from '../components/ui/NuruOSLogo';

export default function SignUpScreen() {
  const navigate = useNavigate();
  const signUp = useAuthStore(s => s.signUp);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signUp(email, password, `${firstName} ${lastName}`);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg-deep">
      {/* Header section */}
      <div className="px-8 pt-14 pb-10">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-white text-[20px]">
              arrow_back
            </span>
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5">
            <NuruOSLogo size={28} color="#BEF264" bgColor="#0B0F19" showRing={false} />
          </div>
        </div>

        <h1 className="font-sora text-4xl font-light text-white">
          Create an Account
        </h1>
        <p className="mt-2 font-manrope text-base text-gray-400">
          Sign up to access NuruOS Field Intelligence tools.
        </p>
      </div>

      {/* Glass card body */}
      <div className="flex-1 glass-card rounded-t-[32px] overflow-hidden">
        <div className="h-full overflow-y-auto px-8 py-8 scrollbar-hide">
          {/* Toggle tabs */}
          <div className="mb-8 flex rounded-full bg-white/5 p-1">
            <button
              onClick={() => navigate('/signin')}
              className="flex-1 rounded-full py-2.5 text-center font-manrope text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 transition-colors hover:text-white"
            >
              SIGN IN
            </button>
            <button
              className="flex-1 rounded-full bg-neon-lime py-2.5 text-center font-manrope text-xs font-bold uppercase tracking-[0.15em] text-black"
              aria-current="page"
            >
              SIGN UP
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                value={firstName}
                onChange={setFirstName}
                placeholder="Jonathan"
                required
              />
              <FormInput
                label="Last Name"
                value={lastName}
                onChange={setLastName}
                placeholder="Smith"
                required
              />
            </div>

            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="janedoe@example.com"
              icon="mail"
              required
            />

            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min 8 characters"
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter password"
              required
            />

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
              onClick={handleRegister}
            >
              REGISTER
            </NeonButton>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-manrope text-[10px] uppercase tracking-[0.15em] text-white/30">
                Or Register With
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="glass-card flex items-center justify-center gap-2 rounded-full py-3 font-manrope text-xs font-semibold text-white transition-all active:scale-95"
                aria-label="Sign up with Google"
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
                aria-label="Sign up with Apple"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.14 4.45-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>

            {/* Login link */}
            <p className="mt-2 text-center font-manrope text-sm text-white/40">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="font-semibold text-neon-cyan transition-colors hover:text-neon-cyan/80"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
