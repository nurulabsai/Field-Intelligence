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

  if (score <= 2) return { label: 'Weak', color: '#EF4444', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: '#F59E0B', width: '66%' };
  return { label: 'Strong', color: '#22C55E', width: '100%' };
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
    setLoading(true);
    try {
      await onSignUp?.(form);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [form, validate, onSignUp]);

  const strength = getPasswordStrength(form.password);

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 16px',
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 500,
    color: '#9CA3AF',
    marginBottom: '6px',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#FCA5A5',
    marginTop: '4px',
  };

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
          Create Account
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.938rem' }}>
          Start your field intelligence journey
        </p>
      </div>

      {/* Full Name */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Full Name</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><User size={18} /></span>
          <input
            type="text"
            value={form.full_name}
            onChange={e => handleChange('full_name', e.target.value)}
            placeholder="Enter your full name"
            style={inputStyle(!!errors.full_name)}
          />
        </div>
        {errors.full_name && <p style={errorStyle}>{errors.full_name}</p>}
      </div>

      {/* Email */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Email Address</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><Mail size={18} /></span>
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            style={inputStyle(!!errors.email)}
          />
        </div>
        {errors.email && <p style={errorStyle}>{errors.email}</p>}
      </div>

      {/* Password */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Password</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><Lock size={18} /></span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={e => handleChange('password', e.target.value)}
            placeholder="Minimum 8 characters"
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
        {errors.password && <p style={errorStyle}>{errors.password}</p>}
        {form.password && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, borderRadius: '4px', transition: 'all 0.3s ease' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: strength.color, marginTop: '4px', display: 'block' }}>{strength.label}</span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Confirm Password</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><Lock size={18} /></span>
          <input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirm_password}
            onChange={e => handleChange('confirm_password', e.target.value)}
            placeholder="Repeat your password"
            style={inputStyle(!!errors.confirm_password)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(p => !p)}
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
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirm_password && <p style={errorStyle}>{errors.confirm_password}</p>}
      </div>

      {/* Role Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Role</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><ShieldCheck size={18} /></span>
          <button
            type="button"
            onClick={() => setRoleOpen(p => !p)}
            style={{
              ...inputStyle(!!errors.role),
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: '40px',
            }}
          >
            <span style={{ color: form.role ? '#FFFFFF' : '#6B7280' }}>
              {form.role || 'Select your role'}
            </span>
            <ChevronDown size={18} style={{ position: 'absolute', right: '14px', color: '#6B7280' }} />
          </button>
          {roleOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: '#1E1E1E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                zIndex: 50,
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            >
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { handleChange('role', role); setRoleOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: form.role === role ? 'rgba(240,81,62,0.15)' : 'transparent',
                    border: 'none',
                    color: form.role === role ? '#F0513E' : '#FFFFFF',
                    fontSize: '0.938rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { if (form.role !== role) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (form.role !== role) (e.target as HTMLElement).style.background = 'transparent'; }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.role && <p style={errorStyle}>{errors.role}</p>}
      </div>

      {/* Organization */}
      <div style={{ marginBottom: '28px' }}>
        <label style={labelStyle}>Organization</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrapStyle}><Building2 size={18} /></span>
          <input
            type="text"
            value={form.organization}
            onChange={e => handleChange('organization', e.target.value)}
            placeholder="Your organization name"
            style={inputStyle(!!errors.organization)}
          />
        </div>
        {errors.organization && <p style={errorStyle}>{errors.organization}</p>}
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
          transition: 'background-color 0.15s ease, transform 0.1s ease',
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
            Creating Account...
          </>
        ) : (
          'Create New Account'
        )}
      </button>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#6B7280' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#F0513E',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            textDecoration: 'none',
          }}
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
        className="nuru-signup-left-panel"
      >
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240,81,62,0.12) 0%, transparent 70%)',
            top: '20%',
            left: '-10%',
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
              padding: '24px',
              backgroundColor: 'rgba(30,30,30,0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              maxWidth: '300px',
            }}
          >
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', fontStyle: 'italic', lineHeight: 1.6 }}>
              "NuruOS transformed how we collect field data across Tanzania. The AI insights save us hours every week."
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '12px' }}>
              - Agricultural Extension Officer, Dodoma
            </p>
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
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Mobile logo */}
          <div className="nuru-signup-mobile-logo" style={{ display: 'none', marginBottom: '32px', textAlign: 'center' }}>
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
          .nuru-signup-left-panel { display: none !important; }
          .nuru-signup-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default SignUpScreen;
