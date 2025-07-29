import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Simple Toast component
const Toast = ({ message, onClose, color = 'rgba(34,197,94,0.95)' }: { message: string; onClose: () => void; color?: string }) => (
  <div
    style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: color,
      color: '#fff',
      padding: '16px 32px',
      borderRadius: 8,
      boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
      zIndex: 1000,
      fontWeight: 500,
      fontSize: 18,
      transition: 'opacity 0.3s',
    }}
    onClick={onClose}
  >
    {message}
  </div>
);

const ResetPasswordPage = () => {
  // Get token from URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  // Animate card on mount
  useEffect(() => {
    const form = document.getElementById('reset-form-container');
    if (form) {
      form.animate(
        [
          { opacity: 0, transform: 'translateY(40px) scale(0.98)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 600, easing: 'cubic-bezier(.4,2,.3,1)', fill: 'forwards' }
      );
    }
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/v1/auth/password/reset', {
        token,
        newPassword,
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #fbc2eb 0%, #a6c1ee 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}
    >
      {/* Blurred background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'url(https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80) center/cover no-repeat',
          filter: 'blur(18px) brightness(0.7)',
          opacity: 0.22,
        }}
      />
      <main
        id="reset-form-container"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          minWidth: 0,
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 28,
          boxShadow: '0 12px 48px 0 rgba(0,0,0,0.18)',
          padding: '3.5rem 2.5rem 2.5rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          minHeight: 380,
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontWeight: 700, color: '#d946ef', fontSize: 32, letterSpacing: -1 }}>
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ position: 'relative' }}>
            <label htmlFor="newPassword" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
              New Password
            </label>
            <input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 44px 14px 16px',
                marginTop: 10,
                borderRadius: 12,
                border: '1.5px solid #d1d5db',
                fontSize: 18,
                background: '#f9fafb',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #d946ef')}
              onBlur={e => (e.currentTarget.style.border = '1.5px solid #d1d5db')}
            />
            <button
              type="button"
              aria-label={showNew ? 'Hide password' : 'Show password'}
              onClick={() => setShowNew(v => !v)}
              style={{
                position: 'absolute',
                right: 10,
                top: 38,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: '#888',
                padding: 0,
              }}
              tabIndex={-1}
            >
              {showNew ? '👁️' : '🙈'}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <label htmlFor="confirmPassword" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 44px 14px 16px',
                marginTop: 10,
                borderRadius: 12,
                border: '1.5px solid #d1d5db',
                fontSize: 18,
                background: '#f9fafb',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #d946ef')}
              onBlur={e => (e.currentTarget.style.border = '1.5px solid #d1d5db')}
            />
            <button
              type="button"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm(v => !v)}
              style={{
                position: 'absolute',
                right: 10,
                top: 38,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: '#888',
                padding: 0,
              }}
              tabIndex={-1}
            >
              {showConfirm ? '👁️' : '🙈'}
            </button>
          </div>
          {error && (
            <div style={{ color: '#dc2626', background: '#fee2e2', borderRadius: 10, padding: '12px 16px', fontWeight: 500, fontSize: 16, marginTop: -6 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 0',
              background: loading ? '#fbcfe8' : '#d946ef',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              marginTop: 4,
              boxShadow: '0 2px 8px #f3e8ff',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: 0.5,
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </main>
      {showToast && (
        <Toast message="Password reset successful!" onClose={() => setShowToast(false)} />
      )}
      <style>{`
        html, body, #root {
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        @media (max-width: 600px) {
          #reset-form-container {
            max-width: 99vw !important;
            padding: 1.2rem 0.2rem 1.2rem 0.2rem !important;
            min-height: 320px !important;
          }
          h2 {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage; 