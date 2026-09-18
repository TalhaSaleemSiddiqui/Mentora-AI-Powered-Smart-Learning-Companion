import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PinModal({ onClose, onSuccess }) {
  const { user, updateUser } = useApp();
  const isSettingPin = !user?.parentPin;
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(isSettingPin ? 'set' : 'enter');
  const [error, setError] = useState('');

  const handleKeypad = (num) => {
    setError('');
    if (step === 'set' && pin.length < 4) {
      setPin(prev => prev + num);
    } else if (step === 'confirm' && confirmPin.length < 4) {
      setConfirmPin(prev => prev + num);
    } else if (step === 'enter' && pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setError('');
    if (step === 'set') setPin(prev => prev.slice(0, -1));
    else if (step === 'confirm') setConfirmPin(prev => prev.slice(0, -1));
    else if (step === 'enter') setPin(prev => prev.slice(0, -1));
  };

  // Auto-submit logic when 4 digits reached
  React.useEffect(() => {
    if (step === 'set' && pin.length === 4) {
      setTimeout(() => setStep('confirm'), 200);
    } else if (step === 'confirm' && confirmPin.length === 4) {
      if (pin === confirmPin) {
        updateUser({ parentPin: pin });
        onSuccess();
      } else {
        setError('PINs do not match. Try again.');
        setPin('');
        setConfirmPin('');
        setStep('set');
      }
    } else if (step === 'enter' && pin.length === 4) {
      if (pin === user.parentPin) {
        onSuccess();
      } else {
        setError('Incorrect PIN.');
        setPin('');
      }
    }
  }, [pin, confirmPin, step, user, updateUser, onSuccess]);

  const displayPin = step === 'confirm' ? confirmPin : pin;
  const title = step === 'set' ? 'Create Parent PIN' : (step === 'confirm' ? 'Confirm PIN' : 'Enter Parent PIN');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(13,27,62,0.85)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(28,45,86,0.9)', border: '1px solid rgba(255,107,74,0.3)',
        borderRadius: '32px', padding: '40px', width: '360px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer' }}>×</button>
        
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚙️</div>
        <div style={{ fontFamily: '"Baloo 2", cursive', fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px', textAlign: 'center' }}>
          {step === 'set' ? 'Set a 4-digit PIN to secure the Parent Portal.' : 'Enter your 4-digit PIN to access advanced settings.'}
        </div>

        {/* PIN Dots */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: displayPin.length > i ? '#FF6B4A' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.2s',
              boxShadow: displayPin.length > i ? '0 0 12px rgba(255,107,74,0.5)' : 'none'
            }}/>
          ))}
        </div>

        {error && <div style={{ color: '#FF6B4A', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>{error}</div>}

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button key={num} onClick={() => handleKeypad(num.toString())} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', height: '60px', fontSize: '24px', fontWeight: 700, color: 'white', cursor: 'pointer'
            }}>{num}</button>
          ))}
          <div /> {/* empty slot */}
          <button onClick={() => handleKeypad('0')} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', height: '60px', fontSize: '24px', fontWeight: 700, color: 'white', cursor: 'pointer'
          }}>0</button>
          <button onClick={handleBackspace} style={{
            background: 'rgba(255,107,74,0.1)', border: '1px solid rgba(255,107,74,0.2)',
            borderRadius: '16px', height: '60px', fontSize: '18px', fontWeight: 700, color: '#FF6B4A', cursor: 'pointer'
          }}>⌫</button>
        </div>
      </div>
    </div>
  );
}
