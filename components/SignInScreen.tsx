import React, { useState } from 'react';
import { Logo } from './Logo';
import './SignInScreen.css';

interface SignInScreenProps {
  onSignIn: (username: string, role: string) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onBack?: () => void;
  loading?: boolean;
  error?: string;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignIn,
  onSignUp,
  onForgotPassword,
  onBack,
  loading = false,
  error,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState('Auditor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      onSignIn(username, role);
    }
  };

  return (
    <div className="signin-screen animate-in fade-in">
      <div className="signin-background"></div>

      {/* Header with logo */}
      <div className="signin-header relative">
        {onBack && (
          <button 
            type="button" 
            onClick={onBack}
            className="absolute left-6 top-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white z-10 active:scale-95 transition-transform"
          >
            <span style={{ fontSize: '18px' }}>←</span>
          </button>
        )}
        <div className="signin-logo-container">
          <Logo variant="full" size="lg" theme="dark" glow showTagline />
        </div>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          color: 'white',
          marginTop: '24px',
          marginBottom: '8px'
        }}>
          Welcome Back
        </h2>
        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '15px',
          color: '#9CA3AF'
        }}>
          Sign in to continue your field audits
        </p>
      </div>

      {/* Sign in form card */}
      <div className="signin-card">
        <form onSubmit={handleSubmit}>
          {/* Username field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username / Phone
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter your username or phone"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <button
                type="button"
                className="btn-link"
                onClick={onForgotPassword}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Auditor">Field Auditor</option>
              <option value="Admin">Supervisor / Admin</option>
            </select>
          </div>

          {/* Remember me */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-text">Remember Me</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="signin-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading || !username || !password}
          >
            {loading ? 'SIGNING IN...' : 'LOGIN'}
          </button>
        </form>

        {/* Sign up link */}
        <div className="signin-footer">
          <span className="footer-text">Don't have an account?</span>
          <button type="button" className="btn-link" onClick={onSignUp}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};