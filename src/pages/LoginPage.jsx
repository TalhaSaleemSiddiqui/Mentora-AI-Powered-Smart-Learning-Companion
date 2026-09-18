import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { playWelcome, playError } from '../utils/sounds';


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

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true); 
  const [isForgotPassView, setIsForgotPassView] = useState(false); 
  const [resetSent, setResetSent] = useState(false); 
  const [role, setRole] = useState('student'); 
  
  // Form States
  const [username, setUsername] = useState('');     
  const [fullName, setFullName] = useState('');     
  const [email, setEmail] = useState('');           
  const [password, setPassword] = useState('');     
  const [confirmPassword, setConfirmPassword] = useState(''); 
  
 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); 
  
  // IMPORT UPDATED CONTEXT FUNCTIONS
  const { loginUser, registerUser, forgotPassword } = useApp();
  const navigate = useNavigate();

  const activeColor = role === 'student' ? '#3DD9C5' : '#FF6B4A';

  // Switch Role (Student/Parent)
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccessMsg('');
  };

  const toggleAuthMode = () => {
    setIsLoginView(!isLoginView);
    setIsForgotPassView(false);
    setResetSent(false);
    setError('');
    setSuccessMsg('');
    setUsername('');
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
   
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email) {
      setError('Please enter your Gmail address.');
      return;
    }
    
    // BACKEND API CALL FOR FORGOT PASSWORD
    await forgotPassword(email);
    setResetSent(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    // Validation for Signup
    if (!isLoginView && password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (email && password && (isLoginView || fullName)) {
      try {
        if (isLoginView) {
          // --- LOGIN FLOW ---
          const res = await loginUser(email, password);
          
          if (res.success) {
            if (role === 'student') {
              playWelcome();
              navigate('/welcome');
            } else {
              navigate('/parent-dashboard');
            }
          } else {
            if (role === 'student') playError();
            setError(res.error || 'Log in failed. Please try again.');
          }
        } else {
          // --- SIGNUP FLOW ---
          const res = await registerUser(role, fullName, email, password);
          
          if (res.success) {
            setSuccessMsg('Account created! Please check your Gmail to verify your account.');
            // Clear signup fields
            setFullName(''); 
            setPassword(''); 
            setConfirmPassword('');
          } else {
            if (role === 'student') playError();
            setError(res.error || 'Sign up failed. Please try again.');
          }
        }
      } catch (err) {
        if (role === 'student') playError();
        setError('An error occurred. Please try again.');
      }
    }
  };

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
          {isForgotPassView ? 'Reset Password' : 'Welcome to Mentora!'}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--w70)', marginBottom: '24px' }}>
          {isForgotPassView 
            ? 'Enter your Gmail to receive a reset link.' 
            : isLoginView 
              ? 'Please log in to continue your learning journey.' 
              : 'Please sign up to start your learning journey.'}
        </div>

        {/* Role Toggles (Hide during Forgot Password) */}
        {!isForgotPassView && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: (error || successMsg) ? '16px' : '24px', width: '100%' }}>
            <button 
              type="button" 
              onClick={() => handleRoleSwitch('student')} 
              style={{ flex: 1, padding: '12px', borderRadius: '12px', background: role === 'student' ? 'rgba(61,217,197,0.2)' : 'var(--w08)', border: `1px solid ${role === 'student' ? '#3DD9C5' : 'transparent'}`, color: role === 'student' ? '#3DD9C5' : 'var(--w40)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: '"Nunito", sans-serif' }}
            >
              Student
            </button>
            <button 
              type="button" 
              onClick={() => handleRoleSwitch('parent')} 
              style={{ flex: 1, padding: '12px', borderRadius: '12px', background: role === 'parent' ? 'rgba(255,107,74,0.2)' : 'var(--w08)', border: `1px solid ${role === 'parent' ? '#FF6B4A' : 'transparent'}`, color: role === 'parent' ? '#FF6B4A' : 'var(--w40)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: '"Nunito", sans-serif' }}
            >
              Parent
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ background: 'rgba(255,107,74,0.15)', border: '1px solid rgba(255,107,74,0.3)', padding: '10px 16px', borderRadius: '12px', color: '#FF6B4A', fontSize: '13px', fontWeight: 700, marginBottom: '20px', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div style={{ background: 'rgba(61,217,197,0.15)', border: '1px solid rgba(61,217,197,0.3)', padding: '10px 16px', borderRadius: '12px', color: '#3DD9C5', fontSize: '13px', fontWeight: 700, marginBottom: '20px', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✨ {successMsg}
          </div>
        )}
        
        {/* FORGOT PASSWORD FORM */}
        {isForgotPassView ? (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {resetSent ? (
              <div style={{ background: 'rgba(61,217,197,0.15)', border: '1px solid rgba(61,217,197,0.3)', padding: '14px 16px', borderRadius: '12px', color: '#3DD9C5', fontSize: '14px', fontWeight: 700, marginBottom: '10px', width: '100%', textAlign: 'center' }}>
                ✨ Password reset link has been sent to your Gmail!
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--w40)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', textAlign: 'left' }}>Gmail</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@gmail.com" 
                  style={{ width: '100%', background: 'var(--w08)', border: '1px solid var(--w15)', borderRadius: '12px', padding: '14px', color: 'var(--white)', fontFamily: '"Nunito", sans-serif', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
            )}

            {!resetSent && (
              <button type="submit" style={{ marginTop: '10px', width: '100%', padding: '14px', borderRadius: '12px', background: role === 'student' ? 'linear-gradient(135deg, var(--teal), #2bbcaa)' : 'linear-gradient(135deg, #FF6B4A, #e55a39)', border: 'none', fontFamily: '"Nunito", sans-serif', fontSize: '15px', fontWeight: '800', color: role === 'student' ? 'var(--navy)' : 'var(--white)', textAlign: 'center', cursor: 'pointer', display: 'inline-block', transition: 'all 0.2s ease' }}>
                Send Reset Link
              </button>
            )}

            <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--w70)', fontWeight: '600' }}>
              Remembered your password? {' '}
              <span 
                onClick={() => { setIsForgotPassView(false); setResetSent(false); setError(''); }} 
                style={{ color: role === 'student' ? '#3DD9C5' : '#FF6B4A', cursor: 'pointer', fontWeight: '800', textDecoration: 'underline' }}
              >
                Log in
              </span>
            </div>
          </form>
        ) : (
          /* LOGIN / SIGNUP FORM */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            
            {/* FULL NAME (Signup Only) */}
            {!isLoginView && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--w40)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', textAlign: 'left' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="Enter your full name" 
                  style={{ width: '100%', background: 'var(--w08)', border: '1px solid var(--w15)', borderRadius: '12px', padding: '14px', color: 'var(--white)', fontFamily: '"Nunito", sans-serif', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
            )}


            {/* GMAIL (Common for both Login and Signup) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--w40)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', textAlign: 'left' }}>Gmail</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="name@gmail.com" 
                style={{ width: '100%', background: 'var(--w08)', border: '1px solid var(--w15)', borderRadius: '12px', padding: '14px', color: 'var(--white)', fontFamily: '"Nunito", sans-serif', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>

            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--w40)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                
              
                {isLoginView && (
                  <span 
                    onClick={() => { setIsForgotPassView(true); setError(''); setSuccessMsg(''); }} 
                    style={{ color: role === 'student' ? '#3DD9C5' : '#FF6B4A', fontSize: '12px', fontWeight: '700', textDecoration: 'none', cursor: 'pointer', transition: '0.2s' }}
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
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

           
            {!isLoginView && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--w40)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', textAlign: 'left' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
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
            )}
            
            <button type="submit" style={{ marginTop: '10px', width: '100%', padding: '14px', borderRadius: '12px', background: role === 'student' ? 'linear-gradient(135deg, var(--teal), #2bbcaa)' : 'linear-gradient(135deg, #FF6B4A, #e55a39)', border: 'none', fontFamily: '"Nunito", sans-serif', fontSize: '15px', fontWeight: '800', color: role === 'student' ? 'var(--navy)' : 'var(--white)', textAlign: 'center', cursor: 'pointer', display: 'inline-block', transition: 'all 0.2s ease' }}>
              {isLoginView ? 'Log in' : 'Create Account ✨'}
            </button>
          </form>
        )}

        {/* Toggle between Login and Signup (Hide during Forgot Password) */}
        {!isForgotPassView && (
          <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--w70)', fontWeight: '600' }}>
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={toggleAuthMode} 
              style={{ color: role === 'student' ? '#3DD9C5' : '#FF6B4A', cursor: 'pointer', fontWeight: '800', textDecoration: 'underline' }}
            >
              {isLoginView ? 'Sign up' : 'Log in'}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}