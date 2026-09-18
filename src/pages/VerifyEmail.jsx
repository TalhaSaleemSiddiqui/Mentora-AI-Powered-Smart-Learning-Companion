import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:8000';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email...');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    // Prevent double-firing in React StrictMode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/verify-email?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Verification failed. The link might be expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Cannot connect to the server.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', background: 'var(--navy)', position: 'fixed', inset: 0 }}>
      <div className="bg-decor">
        <div className="decor-blob blob-1"></div>
        <div className="decor-blob blob-2"></div>
      </div>

      <div className="login-container" style={{ position: 'relative', zIndex: 10, background: 'rgba(28,45,86,0.65)', backdropFilter: 'blur(24px)', border: '1px solid var(--w15)', borderRadius: '40px', padding: '50px', textAlign: 'center', maxWidth: '480px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ marginBottom: '20px' }}>
          <img src="/nobackgroundlogo.png" style={{ height: '85px', width: 'auto', objectFit: 'contain' }} alt="Mentora Logo" />
        </div>
        
        <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--white)', marginBottom: '16px' }}>
          Email Verification
        </div>

        {status === 'loading' && (
          <div style={{ color: '#3DD9C5', fontSize: '16px', fontWeight: '700', marginBottom: '24px' }}>
            ⏳ {message}
          </div>
        )}

        {status === 'success' && (
          <div style={{ background: 'rgba(61,217,197,0.15)', border: '1px solid rgba(61,217,197,0.3)', padding: '16px', borderRadius: '12px', color: '#3DD9C5', fontSize: '15px', fontWeight: 700, marginBottom: '24px' }}>
            ✨ {message}
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: 'rgba(255,107,74,0.15)', border: '1px solid rgba(255,107,74,0.3)', padding: '16px', borderRadius: '12px', color: '#FF6B4A', fontSize: '15px', fontWeight: 700, marginBottom: '24px' }}>
            ⚠️ {message}
          </div>
        )}

        <button 
          onClick={() => navigate('/login')}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--teal), #2bbcaa)', border: 'none', fontFamily: '"Nunito", sans-serif', fontSize: '15px', fontWeight: '800', color: 'var(--navy)', cursor: 'pointer', transition: '0.2s' }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}