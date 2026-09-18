import React from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import MentoraMascot from '../components/MentoraMascot';
import { playPop } from '../utils/sounds';
import { LEVEL_PLAN } from '../data/levelPlanContent';

const VALID_SLUGS = ['addition', 'subtraction', 'multiplication', 'division'];

export default function LevelSelectPage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();

  if (!VALID_SLUGS.includes(topicSlug)) {
    return <Navigate to="/" replace />;
  }

  const plan = LEVEL_PLAN[topicSlug];
  const accentMap = {
    addition:       '#FF6B4A',
    subtraction:    '#F5C842',
    multiplication: '#3DD9C5',
    division:       '#a78bfa',
  };
  const accent = accentMap[topicSlug] ?? '#3DD9C5';

  const cardClass = {
    addition:       'tc-addition',
    subtraction:    'tc-subtraction',
    multiplication: 'tc-multiplication',
    division:       'tc-division',
  }[topicSlug] ?? 'tc-addition';

  const masteryTitles = {
    addition:       ['Seedling', 'Sprout', 'Blooming'],
    subtraction:    ['Explorer', 'Trailblazer', 'Navigator'],
    multiplication: ['Apprentice', 'Wizard', 'Master'],
    division:       ['Explorer', 'Pioneer', 'Expert', 'Legendary'],
  };

  const baseLevels = [
    { n: 1, desc: 'Simple single-digit problems' },
    { n: 2, desc: 'Numbers up to 40' },
    { n: 3, desc: 'Bigger numbers and challenges' },
  ];
  const levels = topicSlug === 'division'
    ? [...baseLevels, { n: 4, desc: 'Large numbers and expert challenges' }]
    : baseLevels;

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
        
        <div style={{ padding: '60px 40px', maxWidth: '1100px', width: '100%', boxSizing: 'border-box' }}>

          <button
            type="button"
            onClick={() => {
              playPop();
              navigate('/');
            }}
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 800,
              fontSize: '13px',
              marginBottom: '24px',
            }}
          >
            ← Back to Components
          </button>
          
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '48px'
          }}>
            
            <div style={{ width: '160px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '-40px 0' }}>
              <div style={{ transform: 'scale(0.85)' }}>
                <MentoraMascot emotion="excited" size={120} />
              </div>
            </div>
            
            {/* Text Container */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                Choose your <span style={{ color: accent }}>{plan.displayName}</span> level
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: '8px', marginBottom: 0 }}>
                Pick a level to start your lesson with Mentora.
              </p>
            </div>
          </div>

          {/* --- LEVELS GRID --- */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {levels.map((lv) => (
              <div
                key={lv.n}
                className={`topic-card ${cardClass}`}
                onClick={() => {
                  playPop();
                  navigate(`/topics/${topicSlug}/lesson/${lv.n}`);
                }}
                style={{ padding: '32px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <div
                  className="t-icon-wrap"
                  style={{
                    width: '70px',
                    height: '70px',
                    fontSize: '32px',
                    borderColor: accent + '40',
                    background: accent + '10',
                    marginBottom: '16px'
                  }}
                >
                  {lv.n}
                </div>
                <div className="t-info" style={{ width: '100%' }}>
                  <div className="t-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {masteryTitles[topicSlug][lv.n - 1]}
                  </div>
                  <div className="t-desc" style={{ fontSize: '15px', marginBottom: '0' }}>
                    {lv.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </PageBackground>
  );
}