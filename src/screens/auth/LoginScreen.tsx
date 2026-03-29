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

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '14px 16px',
    paddingLeft: '44px',
    backgroundColor: 'var(--color-bg-input, #252525)',
    border: `1px solid ${hasError ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.938rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  });

  const iconWrapStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6B7280',
    pointerEvents: 'none',
  };

  const formContent = (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
          Welcome Back
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.938rem' }}>
          Sign in to continue your field audits
        </p>
      </div>

      {/* Email */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 500, color: '#9CA3AF', marginBottom: '6px' }}>
          Email Address
        </label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><Mail size={18} /></span>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
            placeholder="you@example.com"
            style={inputStyle(!!errors.email)}
          />
        </div>
        {errors.email && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{errors.email}</p>}
      </div>

      {/* Password */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 500, color: '#9CA3AF', marginBottom: '6px' }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><Lock size={18} /></span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
            placeholder="Enter your password"
            style={inputStyle(!!errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{errors.password}</p>}
      </div>

      {/* Remember + Forgot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div
            onClick={() => setRememberMe(p => !p)}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              border: `2px solid ${rememberMe ? '#F0513E' : 'rgba(255,255,255,0.2)'}`,
              backgroundColor: rememberMe ? '#F0513E' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {rememberMe && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Remember Me</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          style={{
            background: 'none',
            border: 'none',
            color: '#F0513E',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Forgot Password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: loading ? 'rgba(240,81,62,0.6)' : '#F0513E',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'background-color 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                animation: 'nuru-spin 0.6s linear infinite',
              }}
            />
            Signing in...
          </>
        ) : (
          'Login'
        )}
      </button>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#6B7280' }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToSignUp}
          style={{
            background: 'none',
            border: 'none',
            color: '#F0513E',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            fontFamily: 'inherit',
          }}
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--color-bg-primary, #0D0D0D)',
        fontFamily: 'var(--font-family-base, Inter, sans-serif)',
      }}
    >
      {/* Left Panel - Desktop Only */}
      <div
        className="nuru-login-left-panel"
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(135deg, #171717 0%, #0D0D0D 50%, rgba(240,81,62,0.08) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240,81,62,0.1) 0%, transparent 70%)',
            bottom: '10%',
            right: '-5%',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>NuruOS</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F0513E', display: 'inline-block' }} />
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '340px' }}>
            Smarter Field Audits.<br />Powered by AI.
          </p>
          <div
            style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              maxWidth: '320px',
            }}
          >
            {[
              { value: '2,400+', label: 'Farms Audited' },
              { value: '15', label: 'Regions Covered' },
              { value: '98%', label: 'Data Accuracy' },
              { value: '50+', label: 'Active Agents' },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(30,30,30,0.8)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F0513E' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div className="nuru-login-mobile-logo" style={{ display: 'none', marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>NuruOS</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F0513E', display: 'inline-block' }} />
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
