import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot' | 'reset'
  const [view, setView] = useState('login');
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password Reset states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: forgotEmail });
      
      // If we returned the test OTP, display it in success message for convenience
      const testOtpMsg = res.data.otpForTesting ? ` (OTP for testing: ${res.data.otpForTesting})` : '';
      setSuccess(`OTP sent to your email successfully!${testOtpMsg}`);
      setView('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset OTP. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: forgotEmail,
        otp,
        newPassword
      });
      setSuccess(res.data.message || 'Password reset successfully!');
      setView('login');
      // Autofill email
      setEmail(forgotEmail);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password. Verify your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', width: '100%' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        
        {/* ========================================== */}
        {/* LOGIN VIEW */}
        {/* ========================================== */}
        {view === 'login' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
              <p>Login to your MentorConnect account</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <CheckCircle2 size={20} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-dark)' }} />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-dark)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} 
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
                {loading ? 'Logging in...' : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary-dark)' }}>Don't have an account? </span>
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* FORGOT PASSWORD VIEW */}
        {/* ========================================== */}
        {view === 'forgot' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Forgot Password</h2>
              <p>Enter your email to receive a 6-digit OTP code</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-dark)' }} />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP Code'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '0.9rem' }} 
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
              >
                Back to Login
              </button>
            </form>
          </>
        )}

        {/* ========================================== */}
        {/* RESET PASSWORD VIEW */}
        {/* ========================================== */}
        {view === 'reset' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Reset Password</h2>
              <p>Enter the 6-digit OTP code and your new password</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <CheckCircle2 size={20} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="input-group">
                <label className="input-label">6-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ textAlign: 'center', letterSpacing: '0.2rem', fontWeight: 'bold' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-dark)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem' }} disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '0.9rem' }} 
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
              >
                Back to Login
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
