import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from './hooks/useRole';

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div
    style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: 'rgba(34,197,94,0.95)',
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { setRole } = useRole();

  useEffect(() => {
    const form = document.getElementById('login-form-container');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
        email,
        password,
      });
      
      // Backend'den gelen user bilgisini al
      const userData = response.data;
      
      // Role bilgisini al (backend'den gelen response'a göre)
      let userRole = 'CUSTOMER'; // Default role
      
      // Backend'den gelen response'a göre role'ü belirle
      if (userData.role) {
        userRole = userData.role.toUpperCase();
      } else if (userData.data && userData.data.role) {
        userRole = userData.data.role.toUpperCase();
      }
      
      // Role'ü state'e kaydet (type assertion ile)
      setRole(userRole as "ADMIN" | "AGENT" | "CUSTOMER");
      
      // Token'ı localStorage'a kaydet
      const accessToken = userData.data?.accessToken || userData.accessToken;
      console.log('LoginPage: accessToken exists:', !!accessToken);
      console.log('LoginPage: userRole:', userRole);
      
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('userRole', userRole);
        console.log('LoginPage: Token and role saved to localStorage');
      } else {
        console.error('No accessToken in response!');
      }
      
      setShowToast(true);
      
      // Trigger CustomerContext to check for new token
      window.dispatchEvent(new Event('storage'));
      
      // localStorage'a yazma işleminin tamamlanmasını bekle
      setTimeout(() => {
        setShowToast(false);
        // Role'e göre yönlendirme
        if (userRole === 'ADMIN') {
          navigate('/admin');
        } else if (userRole === 'AGENT') {
          navigate('/agent');
        } else {
          navigate('/customer');
        }
      }, 500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid credentials or server error.'
      );
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
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
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
            'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80) center/cover no-repeat',
          filter: 'blur(18px) brightness(0.7)',
          opacity: 0.22,
        }}
      />
      <main
        id="login-form-container"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 480,
          minWidth: 0,
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 28,
          boxShadow: '0 12px 48px 0 rgba(0,0,0,0.18)',
          padding: '3.5rem 2.5rem 2.5rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          minHeight: 480,
          justifyContent: 'center',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontWeight: 700, color: '#2563eb', fontSize: 36, letterSpacing: -1 }}>
          Welcome
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <label htmlFor="email" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                marginTop: 10,
                borderRadius: 12,
                border: '1.5px solid #d1d5db',
                fontSize: 18,
                background: '#f9fafb',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
              onBlur={e => (e.currentTarget.style.border = '1.5px solid #d1d5db')}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                marginTop: 10,
                borderRadius: 12,
                border: '1.5px solid #d1d5db',
                fontSize: 18,
                background: '#f9fafb',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
              onBlur={e => (e.currentTarget.style.border = '1.5px solid #d1d5db')}
            />
          </div>
          {error && (
            <div
              style={{
                color: '#dc2626',
                background: '#fee2e2',
                borderRadius: 10,
                padding: '12px 16px',
                fontWeight: 500,
                fontSize: 16,
                marginTop: -6,
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 0',
              background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              marginTop: 4,
              boxShadow: '0 2px 8px #dbeafe',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: 0.5,
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link to="/forgot-password" style={{ color: '#2563eb', fontWeight: 500, fontSize: 16, textAlign: 'center', textDecoration: 'none' }}>
            Forgot your password?
          </Link>
          <div style={{ textAlign: 'center', fontSize: 16 }}>
            <span style={{ color: '#555' }}>Don't have an account? </span>
                      <Link to="/register" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>
            Register
          </Link>
          </div>
        </div>
      </main>
      {showToast && (
        <Toast message="Login successful" onClose={() => setShowToast(false)} />
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
          #login-form-container {
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

export default LoginPage; 