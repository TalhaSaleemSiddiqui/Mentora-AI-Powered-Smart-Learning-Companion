import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import MentoraMascot from '../components/MentoraMascot';
import { useApp } from '../context/AppContext';
import { playPop } from '../utils/sounds';

export default function TopicsPage() {
  const { topics } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Base stroke circumference for progress ring
  const getOffset = (pct) => 94 - (94 * (pct / 100));

  return (
    <PageBackground>
      
      <div style={{ 
        height: '100vh', 
        width: '100%', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* --- SEARCH BAR SECTION --- */}
        <div style={{ padding: '32px 40px 0', maxWidth: '1100px', width: '100%', display: 'flex', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'rgba(28,45,86,0.8)', 
            border: '1px solid rgba(61,217,197,0.3)', 
            borderRadius: '20px', 
            padding: '10px 20px', 
            width: '100%',
            maxWidth: '350px',
            boxShadow: '0 8px 32px rgba(61,217,197,0.15)'
          }}>
            <span style={{ fontSize: '18px', opacity: 0.7 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search topics..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontSize: '15px', 
                fontWeight: 600, 
                width: '100%', 
                outline: 'none',
                fontFamily: '"Nunito", sans-serif'
              }} 
            />
          </div>
        </div>

        {/* --- HERO SECTION --- */}
        <div style={{ padding: '20px 40px 0', maxWidth: '1100px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(61,217,197,0.15) 0%, rgba(28,45,86,0.6) 100%)',
            borderRadius: '32px',
            padding: '20px 40px', 
            border: '1.5px solid rgba(61,217,197,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '90px', opacity: 0.08, transform: 'rotate(15deg)' }}>🚀</div>
            
            <div style={{ flexShrink: 0, transform: 'scale(0.85)', margin: '-20px 0' }}>
              <MentoraMascot emotion="excited" size={180} />
            </div>
            
            <div style={{ flex: 1, padding: '10px 0' }}>
              <div style={{ fontSize: '38px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '8px' }}>
                Choose Your <span style={{ color: '#3DD9C5' }}>Math Adventure!</span> 🌟
              </div>
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: 0 }}>
                Which world will you master today? Click a topic to start your lesson!
              </p>
            </div>
          </div>
        </div>

        {/* --- TOPICS GRID --- */}
        <div style={{ padding: '0 40px 80px', maxWidth: '1100px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              { id: 'Addition', class: 'tc-addition', icon: '➕', color: '#FF6B4A', desc: 'Learn to combine numbers and count together.' },
              { id: 'Subtraction', class: 'tc-subtraction', icon: '➖', color: '#F5C842', desc: 'Taking away numbers and finding differences.' },
              { id: 'Multiplication', class: 'tc-multiplication', icon: '✖️', color: '#3DD9C5', desc: 'Super fast addition! Learn times tables easily.' },
              { id: 'Division', class: 'tc-division', icon: '➗', color: '#a78bfa', desc: 'Fair sharing! Split numbers into equal groups.' },
            ]
            .filter(t => t.id.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(t => {
              const topicData = topics[t.id] || { pct: 0, level: 1 };
              return (
                <div 
                  key={t.id} 
                  className={`topic-card ${t.class}`} 
                  onClick={() => { 
                    playPop(); 
                    if (t.id === 'Addition') navigate('/topics/addition/levels');
                    else if (t.id === 'Subtraction') navigate('/topics/subtraction/levels');
                    else if (t.id === 'Multiplication') navigate('/topics/multiplication/levels');
                    else if (t.id === 'Division') navigate('/topics/division/levels');
                    else navigate(`/extra?topic=${t.id.toLowerCase()}`);
                  }} 
                  style={{ padding: '32px', cursor: 'pointer' }}
                >
                  <div className="t-icon-wrap" style={{ width: '70px', height: '70px', fontSize: '32px', borderColor: t.color + '40', background: t.color + '10' }}>{t.icon}</div>
                  <div className="t-info">
                    <div className="t-title" style={{ fontSize: '24px' }}>{t.id}</div>
                    <div className="t-desc" style={{ fontSize: '15px', marginBottom: '20px' }}>{t.desc}</div>
                    <div className="t-meta">
                      <div className="t-tags"><span className="t-tag" style={{ color: t.color }}>Level {topicData.level}</span></div>
                      <div className="t-progress-ring" style={{ width: '42px', height: '42px' }}>
                        <svg viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
                          <circle cx="18" cy="18" r="15" fill="none" stroke={t.color} strokeWidth="4" strokeDasharray="94" strokeDashoffset={getOffset(topicData.pct)} strokeLinecap="round" />
                        </svg>
                        <span className="t-pct" style={{ fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{topicData.pct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </PageBackground>
  );
}