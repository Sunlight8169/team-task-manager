import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Step 1: email, Step 2: new password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 - Verify email exists
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Check if email exists by calling reset API with dummy password
      const res = await API.post('/check-email', { email });
      if (res.data.exists) {
        setStep(2); // Move to password reset step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No account found with this email');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 - Set new password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check minimum password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/reset-password', {
        email,
        new_password: newPassword,
      });
      setSuccess(res.data.message);
      // Redirect to login after success
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Header */}
        <h1 className="auth-title">
          {step === 1 ? 'Forgot Password?' : 'Set New Password'}
        </h1>
        <p className="auth-subtitle">
          {step === 1
            ? 'Enter your registered email address'
            : `Setting new password for ${email}`}
        </p>

        {/* Error and Success Messages */}
        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'step-active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'step-active' : ''}`}>2</div>
        </div>

        {/* Step 1 - Email Form */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Checking...' : 'Verify Email →'}
            </button>
          </form>
        )}

        {/* Step 2 - New Password Form */}
        {step === 2 && (
          <form onSubmit={handlePasswordReset} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password ✓'}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <p className="auth-switch">
          Remember your password? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}