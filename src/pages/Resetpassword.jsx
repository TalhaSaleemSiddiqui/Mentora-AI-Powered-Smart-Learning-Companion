import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:8000';


const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || 'Password reset successfully!');
        setPassword('');
        setConfirmPassword('');
       
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        setError(data.detail || 'Failed to reset password. The link might be expired.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hover color for SVG
  const activeColor = '#FF6B4A';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', background: 'var(--navy)', position: 'fixed', inset: 0, overflowY: 'auto' }}>
      
      {/* Background Decor */}
      <div className="bg-decor">
        <div className="decor-blob blob-1"></div>
        <div className="decor-blob blob-2"></div>
      </div>

      {/* Centered Glassmorphism Box */}
      <div className="login-container" style={{ position: 'relative', zIndex: 10, background: 'rgba(28,45,86,0.65)', backdropFilter: 'blur(24px)', border: '1px solid var(--w15)', borderRadius: '40px', padding: '50px', textAlign: 'center', maxWidth: '480px', width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', margin: 'auto' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <img src="/nobackgroundlogo.png" style={{ height: '140px', width: 'auto', objectFit: 'contain' }} alt="Mentora Logo" />
        </div>
        
        <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--white)', marginBottom: '8px' }}>
          Set New Password
        </div>
        <div style={{ fontSize: '14px', color: 'var(--w70)', marginBottom: '32px' }}>
          Enter your new password below.
        </div>

        {error && (
          <div style={{ background: 'rgba(255,107,74,0.15)', border: '1px solid rgba(255,107,74,0.3)', padding: '10px 16px', borderRadius: '12px', color: '#FF6B4A', fontSize: '13px', fontWeight: 700, marginBottom: '20px', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(61,217,197,0.15)', border: '1px solid rgba(61,217,197,0.3)', padding: '14px 16px', borderRadius: '12px', color: '#3DD9C5', fontSize: '14px', fontWeight: 700, marginBottom: '20px', width: '100%', textAlign: 'center' }}>
            ✨ {successMsg}
          </div>
        )}

        {successMsg ? (
          <button 
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--teal), #2bbcaa)', border: 'none', fontFamily: '"Nunito", sans-serif', fontSize: '15px', fontWeight: '800', color: 'var(--navy)', cursor: 'pointer' }}
          >
            Go to Login
          </button>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--w40)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', textAlign: 'left' }}>New Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{ width: '100%', background: 'var(--w08)', border: '1px solid var(--w15)', borderRadius: '12px', padding: '14px', paddingRight: '48px', color: 'var(--white)', fontFamily: '"Nunito", sans-serif', outline: 'none', boxSizing: 'border-box' }} 
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--w70)', opacity: 0.7, transition: 'all 0.2s ease', WebkitUserSelect: 'none', userSelect: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = activeColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.color = 'var(--w70)'; }}
                >
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </div>
              </div>
            </div>
            
           
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--w40)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', textAlign: 'left' }}>Confirm New Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{ width: '100%', background: 'var(--w08)', border: '1px solid var(--w15)', borderRadius: '12px', padding: '14px', paddingRight: '48px', color: 'var(--white)', fontFamily: '"Nunito", sans-serif', outline: 'none', boxSizing: 'border-box' }} 
                />
                <div 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--w70)', opacity: 0.7, transition: 'all 0.2s ease', WebkitUserSelect: 'none', userSelect: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = activeColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.color = 'var(--w70)'; }}
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ marginTop: '10px', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #FF6B4A, #e55a39)', border: 'none', fontFamily: '"Nunito", sans-serif', fontSize: '15px', fontWeight: '800', color: 'var(--white)', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s ease' }}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}