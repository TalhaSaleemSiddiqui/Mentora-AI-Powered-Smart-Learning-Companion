import React from 'react';
import Topbar from '../components/Topbar';
import PageBackground from '../components/PageBackground';
import { useApp } from '../context/AppContext';

export default function StatsPage() {
  const { user, stats, topics } = useApp();

  return (
    <PageBackground>
      
      <div style={{ height: '100vh', width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        
        <Topbar title={<>Your <span style={{color:'#FF6B4A'}}>Dashboard</span> 📈</>} subtitle={`Check out how much you've grown this week, ${user?.name || 'Zara'}!`} />
        
        <div style={{ padding: '24px 40px 120px', maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { icon: '🎯', val: stats.questionsAnswered, label: 'Questions Answered', trend: '↑ 12%', color: '#3DD9C5', cls: 'slide-up-1' },
              { icon: '⚡', val: `${stats.accuracy}%`,    label: 'Avg Accuracy',        trend: '↑ 3%',  color: '#FF6B4A', cls: 'slide-up-2' },
              { icon: '💡', val: stats.ahaMoments,        label: "Aha! Moments",        trend: '↑ 5',   color: '#a78bfa', cls: 'slide-up-3' },
            ].map(k => (
              <div key={k.label} className={`kpi-card ${k.cls}`} style={{
                background: 'rgba(28,45,86,0.55)', backdropFilter: 'blur(12px)',
                border: `1px solid ${k.color}25`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 20px 40px ${k.color}25`; e.currentTarget.style.borderColor = k.color + '40'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor = k.color + '25'; }}>
                <span style={{ fontSize: '28px', display: 'inline-block', animation: 'floatBadge 3s ease-in-out infinite' }}>{k.icon}</span>
                <div style={{  fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{k.label}</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: k.color }}>{k.trend} vs last week</div>
              </div>
            ))}
          </div>

          {/* Activity Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px' }}>
              <div style={{  fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Daily Activity</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '24px' }}>Minutes spent learning</div>
              <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '0 8px' }}>
                {stats.dailyActivity.map(d => {
                  const isHigh = d.h > 60;
                  return (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{
                        width: '100%', height: `${Math.max(10, Math.min(100, d.h))}%`, borderRadius: '8px 8px 4px 4px',
                        background: isHigh
                          ? 'linear-gradient(180deg, #FF6B4A, rgba(255,107,74,0.3))'
                          : 'linear-gradient(180deg, rgba(61,217,197,0.7), rgba(61,217,197,0.15))',
                        transition: 'height .5s ease',
                      }}/>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{d.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px' }}>
              <div style={{  fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Recent Test Scores</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '24px' }}>Score progression</div>
              <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                {(() => {
                  const scores = Array.isArray(stats.recentScores) && stats.recentScores.length > 0 ? stats.recentScores : [0];
                  const displayScores = scores.length < 5 ? [...Array(5 - scores.length).fill(0), ...scores] : scores;
                  const maxS = Math.max(150, ...displayScores);
                  const w = 240, h = 130;
                  const points = displayScores.map((v, i) => `${i * (w / (displayScores.length - 1))},${h - (v / maxS) * h}`).join(' ');
                  
                  return (
                    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      {/* Fill */}
                      <polygon points={`0,${h} ${points} ${w},${h}`} fill="rgba(245,200,66,0.1)" />
                      {/* Line */}
                      <polyline points={points} fill="none" stroke="#F5C842" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Dots */}
                      {displayScores.map((v, i) => (
                        <circle key={i} cx={i * (w / (displayScores.length - 1))} cy={h - (v / maxS) * h} r="4" fill="#F5C842" stroke="rgba(28,45,86,1)" strokeWidth="2" />
                      ))}
                    </svg>
                  );
                })()}
              </div>
            </div>

            <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px' }}>
              <div style={{  fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Areas to Improve</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '20px' }}>Mentora's recommendations</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  const topicList = [
                    { name: 'Addition',       pct: topics.Addition?.pct       || 0 },
                    { name: 'Subtraction',    pct: topics.Subtraction?.pct    || 0 },
                    { name: 'Multiplication', pct: topics.Multiplication?.pct || 0 },
                    { name: 'Division',       pct: topics.Division?.pct       || 0 },
                  ];
                  const areasToImprove = [...topicList]
                    .sort((a, b) => a.pct - b.pct)
                    .slice(0, 3)
                    .map(t => ({
                      icon: t.pct < 30 ? '😬' : t.pct < 70 ? '😐' : '🙂',
                      name: t.name,
                      sub:  t.pct < 30 ? 'Needs practice' : t.pct < 70 ? 'Getting better!' : 'Almost there!',
                    }));
                  return areasToImprove.map(w => (
                    <div key={w.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '22px' }}>{w.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{w.name}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{w.sub}</div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

         {/* Topic mastery */}
          <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px' }}>
            <div style={{  fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '20px' }}>Topic Mastery 🗺️</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Addition', pct: topics.Addition?.pct || 0, color: '#FF6B4A' },
                { name: 'Subtraction', pct: topics.Subtraction?.pct || 0, color: '#F5C842' },
                { name: 'Multiplication', pct: topics.Multiplication?.pct || 0, color: '#3DD9C5' },
                { name: 'Division', pct: topics.Division?.pct || 0, color: '#a78bfa' },
                { name: 'Fractions', pct: topics.Fractions?.pct || 0, color: '#FF7EB9' },
              ].map(t => {
                
                const cappedPct = Math.min(100, t.pct); 

                return (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '110px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>{t.name}</div>
                    <div style={{ flex: 1, height: '8px', borderRadius: '100px', background: 'rgba(255,255,255,0.07)' }}>
                    
                      <div style={{ height: '100%', width: `${cappedPct}%`, borderRadius: '100px', background: `linear-gradient(90deg, ${t.color}, ${t.color}80)`, transition: 'width 1s ease' }}/>
                    </div>
                    
                    <div style={{ width: '36px', fontSize: '12px', fontWeight: 800, color: t.color, textAlign: 'right', flexShrink: 0 }}>{cappedPct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent results */}
          <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Recent Results 🏆</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '20px' }}>Your last 5 completed levels</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(() => {
                const results = Array.isArray(stats.recentResults) ? stats.recentResults : [];
                if (results.length === 0) {
                  return (
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, padding: '8px 0' }}>
                      Complete a lesson to see your results here!
                    </div>
                  );
                }
                return [...results].reverse().map((r, i) => {
                  const c = r.pct >= 80 ? '#3DD9C5' : r.pct >= 50 ? '#F5C842' : '#FF6B4A';
                  return (
                    <div
                      key={`${r.topic}-${r.level}-${i}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>
                        {r.topic} <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>· Level {r.level}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: c }}>
                        {r.pct}%
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

        </div>
      </div>
    </PageBackground>
  );
}