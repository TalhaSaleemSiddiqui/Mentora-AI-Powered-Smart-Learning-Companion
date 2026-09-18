import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import PageBackground from '../components/PageBackground';
import { useApp } from '../context/AppContext';

export default function ParentDashboard() {
  const { user, stats, topics, chats, lessonSessions, updateUser, fetchLessonAnalytics } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  const topicsArray = Object.entries(topics).map(([name, data]) => ({ name, ...data }));
  topicsArray.sort((a,b) => b.pct - a.pct);
  const strongest = topicsArray[0];
  const weakest = topicsArray[topicsArray.length - 1];

  const pathwayBreakdown = stats.pathwayBreakdown || { mastering: 0, 'on-track': 0, struggling: 0 };
  const pathwayTotal = Math.max(
    1,
    (pathwayBreakdown.mastering || 0) + (pathwayBreakdown['on-track'] || 0) + (pathwayBreakdown.struggling || 0),
  );
  const pathwayRows = [
    { key: 'mastering', label: 'Mastering', color: '#3DD9C5', count: pathwayBreakdown.mastering || 0 },
    { key: 'on-track', label: 'On Track', color: '#a78bfa', count: pathwayBreakdown['on-track'] || 0 },
    { key: 'struggling', label: 'Struggling', color: '#FF6B4A', count: pathwayBreakdown.struggling || 0 },
  ];
  const recentScores = Array.isArray(stats.recentScores) && stats.recentScores.length > 0 ? stats.recentScores : [0];
  const displayScores = recentScores.length < 5 ? [...Array(5 - recentScores.length).fill(0), ...recentScores] : recentScores;
  const maxScore = Math.max(100, ...displayScores);

  const pathwayBadge = (pathway) => {
    const p = (pathway || 'on-track').toLowerCase();
    if (p === 'mastering') return { text: 'Mastering', color: '#3DD9C5', bg: 'rgba(61,217,197,0.15)' };
    if (p === 'struggling') return { text: 'Struggling', color: '#FF6B4A', bg: 'rgba(255,107,74,0.15)' };
    return { text: 'On Track', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' };
  };

  const formatMs = (ms) => {
    if (!ms) return '—';
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  // Form states
  const [fName, setFName] = useState(user?.name || '');
  const [fPhone, setFPhone] = useState(user?.phoneNumber || '');
  const [fPass, setFPass] = useState(user?.password || '');
  const [saveMsg, setSaveMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateUser({ name: fName, phoneNumber: fPhone, password: fPass });
    setSaveMsg('Settings saved successfully!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const toggleAdvanced = () => {
    updateUser({ higherLevelUnlocked: !user?.higherLevelUnlocked });
  };

  return (
    <PageBackground style={{ overflowY: 'auto' }}>
      <Topbar title={<><span style={{color:'#a78bfa'}}>Parent</span> Portal ⚙️</>} subtitle={`Monitor and manage ${user?.name || 'your child'}'s learning journey.`} />
      
      <div style={{ padding: '0 40px 80px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(28,45,86,0.6)', padding: '8px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { id: 'analytics', label: '📊 Analytics & Growth' },
            { id: 'settings', label: '⚙️ Account Settings' },
            { id: 'chats', label: '💬 Chat Logs' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: '12px 0', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '14px', transition: 'all .2s',
              background: activeTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === t.id ? 'white' : 'rgba(255,255,255,0.6)',
              boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn .3s ease' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ background: 'rgba(28,45,86,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{stats.accuracy}%</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Overall Accuracy</div>
              </div>
              <div style={{ background: 'rgba(28,45,86,0.5)', border: '1px solid rgba(61,217,197,0.2)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>💪</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#3DD9C5', lineHeight: 1 }}>{strongest?.name || '—'}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Strongest ({strongest?.pct || 0}%)</div>
              </div>
              <div style={{ background: 'rgba(28,45,86,0.5)', border: '1px solid rgba(255,107,74,0.2)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>👀</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B4A', lineHeight: 1 }}>{weakest?.name || '—'}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Needs Practice ({weakest?.pct || 0}%)</div>
              </div>
              <div style={{ background: 'rgba(28,45,86,0.5)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏱️</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#F5C842', lineHeight: 1 }}>{formatMs(stats.avgResponseMs)}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Avg Response Time</div>
              </div>
            </div>

            {/* Topic mastery + adaptive pathways */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Topic Mastery</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>Best level progress across all modules</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {topicsArray.map((t) => (
                    <div key={t.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{t.name}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Level {t.level} · {t.pct}%</span>
                      </div>
                      <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.max(4, t.pct)}%`, height: '100%',
                          background: 'linear-gradient(90deg, #3DD9C5, #a78bfa)',
                          borderRadius: '999px',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Adaptive Pathways</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
                  How {user?.name || 'your child'} has been learning · {stats.bonusQuestionsUsed || 0} bonus helps used
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pathwayRows.map((row) => (
                    <div key={row.key}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '6px',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: row.color }}>{row.label}</span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: 'rgba(255,255,255,0.55)',
                          minWidth: '28px',
                          textAlign: 'right',
                          flexShrink: 0,
                        }}>
                          {row.count}
                        </span>
                      </div>
                      <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.max(4, (row.count / pathwayTotal) * 100)}%`, height: '100%',
                          background: row.color, borderRadius: '999px',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '18px', padding: '12px 14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.65)',
                }}>
                  Current trend: <span style={{ color: pathwayBadge(stats.dominantPathway).color }}>{pathwayBadge(stats.dominantPathway).text}</span>
                  {' · '}{stats.questionsAnswered || 0} questions · {stats.ahaMoments || 0} perfect scores
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              {/* Daily Activity Graph */}
              <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Weekly Activity</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>Learning time from completed lessons</div>
                <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '0 8px' }}>
                  {stats.dailyActivity.map(d => (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{
                        width: '100%', height: `${Math.max(10, Math.min(100, d.h))}%`, borderRadius: '8px 8px 4px 4px',
                        background: 'linear-gradient(180deg, #a78bfa, rgba(167,139,250,0.2))'
                      }}/>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score progression */}
              <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Recent Scores</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>Last {displayScores.length} level results (%)</div>
                <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  {displayScores.map((val, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#F5C842' }}>{val || ''}</span>
                      <div style={{
                        width: '100%',
                        height: `${Math.max(8, (val / maxScore) * 100)}%`,
                        borderRadius: '8px 8px 4px 4px',
                        background: 'linear-gradient(180deg, #F5C842, rgba(245,200,66,0.2))',
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent lesson sessions */}
            <div style={{ background: 'rgba(28,45,86,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>Recent Lessons</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>Saved adaptive performance from completed levels</div>
                </div>
                <button
                  type="button"
                  onClick={() => user?.user_id && fetchLessonAnalytics(user.user_id)}
                  style={{
                    padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Refresh
                </button>
              </div>
              {lessonSessions.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No completed lessons saved yet. Finish a level to see performance here.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lessonSessions.slice(0, 8).map((s) => {
                    const badge = pathwayBadge(s.dominant_pathway);
                    return (
                      <div key={s.id} style={{
                        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center',
                        background: 'rgba(13,27,62,0.4)', borderRadius: '14px', padding: '14px 16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div style={{ fontWeight: 800, color: 'white', fontSize: '14px' }}>{s.topic} · Level {s.level}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{s.score}/{s.total_questions} correct</div>
                        <div style={{ fontSize: '13px', color: '#F5C842', fontWeight: 700 }}>{s.pct}%</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{formatMs(s.avg_response_ms)} avg</div>
                        <div style={{
                          justifySelf: 'start', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                          color: badge.color, background: badge.bg,
                        }}>
                          {badge.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {/* Advanced Toggles */}
              <div style={{ background: 'rgba(28,45,86,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Curriculum Control</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Enable advanced/higher-level testing material for {user?.name}.</div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>Higher-Level Tests</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Unlocks 2 advanced modules</div>
                  </div>
                  <button onClick={toggleAdvanced} style={{
                    width: '48px', height: '26px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                    background: user?.higherLevelUnlocked ? '#3DD9C5' : 'rgba(255,255,255,0.2)',
                    position: 'relative', transition: 'all .3s'
                  }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                      position: 'absolute', top: '3px', left: user?.higherLevelUnlocked ? '25px' : '3px',
                      transition: 'all .3s'
                    }}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} style={{ background: 'rgba(28,45,86,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn .3s ease' }}>
            <div style={{  fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Manage Account Details</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Student Username</label>
              <input type="text" value={fName} onChange={e=>setFName(e.target.value)} style={{ background: 'rgba(13,27,62,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px', color: 'white', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Parent Phone Number</label>
              <input type="text" value={fPhone} onChange={e=>setFPhone(e.target.value)} placeholder="+1 234 567 8900" style={{ background: 'rgba(13,27,62,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px', color: 'white', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Change Login Password</label>
              <input type="password" value={fPass} onChange={e=>setFPass(e.target.value)} style={{ background: 'rgba(13,27,62,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px', color: 'white', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <button type="submit" style={{ background: '#a78bfa', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
              {saveMsg && <div style={{ color: '#3DD9C5', fontSize: '13px', fontWeight: 700 }}>{saveMsg}</div>}
            </div>
          </form>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <div style={{ background: 'rgba(28,45,86,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn .3s ease' }}>
            <div style={{  fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Student Chat Activity Logs</div>
            {chats.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No chat logs available.</div>
            ) : (
              chats.map(chat => (
                <div key={chat.id} style={{ background: 'rgba(13,27,62,0.4)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontWeight: 800, color: '#3DD9C5', marginBottom: '12px', fontSize: '15px' }}>{chat.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {chat.messages.slice(0, 3).map(m => (
                      <div key={m.id} style={{ fontSize: '13px', color: m.role==='user'?'white':'rgba(255,255,255,0.6)' }}>
                        <span style={{ fontWeight: 800, marginRight: '8px', color: m.role==='user'?'#FF6B4A':'rgba(255,255,255,0.3)' }}>{m.role==='user' ? 'Student' : 'AI'}:</span>
                        {m.text}
                      </div>
                    ))}
                    {chat.messages.length > 3 && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>+ {chat.messages.length - 3} more messages...</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PageBackground>
  );
}
