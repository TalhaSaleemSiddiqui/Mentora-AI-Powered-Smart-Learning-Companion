import React from 'react';
import Topbar from '../components/Topbar';
import PageBackground from '../components/PageBackground';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { user, stats, topics } = useApp();

  return (
    <PageBackground style={{ overflowY: 'auto' }}>
      <Topbar title={<>Your <span style={{color:'#3DD9C5'}}>Profile</span> 👤</>} subtitle={`Manage your account and view career stats.`} />
      
      <div style={{ padding: '24px 40px 80px', maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Profile Header Card */}
        <div style={{
          background: 'rgba(28,45,86,0.65)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.14)', borderRadius: '24px',
          padding: '40px', display: 'flex', alignItems: 'center', gap: '32px',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative background blur */}
          <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,107,74,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }}/>

          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B4A, #F5C842)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '48px', color: '#0D1B3E', flexShrink: 0,
            textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(255,107,74,0.4)',
            zIndex: 1
          }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1, textTransform: 'capitalize', marginBottom: '8px' }}>
              {user?.name || 'Student'}
            </div>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(61,217,197,0.15)', border: '1px solid rgba(61,217,197,0.3)', borderRadius: '100px', color: '#3DD9C5', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {user?.role || 'Learner'} Account
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#F5C842', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🌟 Lifetime Achievements <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }}/>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { label: 'Total Score', val: stats.score, icon: '🏆', color: '#F5C842' },
              { label: 'Questions Answered', val: stats.questionsAnswered, icon: '📝', color: '#3DD9C5' },
              { label: 'Aha! Moments', val: stats.ahaMoments, icon: '💡', color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)',
                border: `1px solid ${s.color}30`, borderRadius: '20px', padding: '24px',
                display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px' }}>{s.icon}</div>
                <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageBackground>
  );
}
