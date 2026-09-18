import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { playWhoosh, playPop } from '../utils/sounds';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { user, chats, currentChatId, setCurrentChatId, togglePinChat, deleteChat, createNewChat, logout } = useApp();
  const [hoveredChat, setHoveredChat] = useState(null);

  const navItems = [
    { 
      to: '/welcome', 
      label: 'Home',
      color: '#FF7EB9',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* This new path will make a proper home. */}
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    { 
      to: '/stats',  
      label: 'Stats',
      color: '#F5C842',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    { 
      to: '/games',  
      label: 'Games',
      color: '#a78bfa',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="8" x2="8" y2="16"/><circle cx="17" cy="9" r="1"/><circle cx="17" cy="15" r="1"/><rect x="2" y="6" width="20" height="12" rx="2"/>
        </svg>
      )
    }
  ];

  const sorted = [...chats].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleLogout = () => {
    sessionStorage.removeItem('mentora_welcomed');
    logout();
    navigate('/student-login');
  };

  return (
    <div style={{
      width: '220px',
      flexShrink: 0,
      background: 'rgba(15,25,60,0.85)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0 16px',
      position: 'relative',
      zIndex: 10,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 16px 20px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          <img src="/nobackgroundlogo.png" style={{ width: '120%', height: '120%', objectFit: 'contain' }} alt="Logo" />
        </div>
        <div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 900, 
            background: 'linear-gradient(135deg, #fff649ff, #3DD9C5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1 
          }}>Mentora</div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(61,217,197,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Learning</div>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 10px', flexShrink: 0 }}>
        {navItems.map(item => {
          const active = item.to === '/welcome' ? path === '/welcome' : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => { playWhoosh(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px',
                borderRadius: '14px',
                textDecoration: 'none',
                color: active ? item.color : 'rgba(255,255,255,0.6)',
                background: active ? `${item.color}15` : 'transparent',
                border: active ? `1px solid ${item.color}30` : '1px solid transparent',
                transition: 'all .2s ease',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 700,
                fontSize: '14px',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              <div style={{ 
                width: '32px', height: '32px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                borderRadius: '10px',
                background: active ? `${item.color}25` : `${item.color}10`,
                transition: 'all .2s ease',
              }}>
                {item.icon(active ? item.color : `${item.color}80`)}
              </div>
              <span style={{ fontSize: '13.5px' }}>{item.label}</span>
              {active && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />}
            </Link>
          );
        })}
      </div>

      {/* Divider + Chat History */}
      <div style={{ margin: '16px 10px 8px', height: '1px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

      <div style={{ padding: '0 16px 8px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>Chats</div>
        <button onClick={async () => { playPop(); const id = createNewChat(); navigate(`/extra?chat=${id}`); }} style={{
          background: 'rgba(61,217,197,0.1)', border: '1px solid rgba(61,217,197,0.2)', color: '#3DD9C5',
          width: '24px', height: '24px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          transition: 'all .2s'
        }} title="New Chat" onMouseEnter={e=>e.currentTarget.style.background='rgba(61,217,197,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(61,217,197,0.1)'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <style>{`
          .chat-item-scroll::-webkit-scrollbar { width: 3px; }
          .chat-item-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
        `}</style>
        {sorted.map(chat => {
          const isActive = String(chat.id) === String(currentChatId);
          return (
            <div
              key={chat.id}
              className="chat-item-scroll"
              onClick={() => { setCurrentChatId(chat.id); navigate(`/extra?chat=${chat.id}`); }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '9px 10px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.09)' : (hoveredChat === chat.id ? 'rgba(255,255,255,0.05)' : 'transparent'),
                border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                transition: 'all .15s',
                gap: '8px',
                flexShrink: 0,
              }}
              onMouseEnter={() => setHoveredChat(chat.id)}
              onMouseLeave={() => setHoveredChat(null)}
            >
              {chat.pinned && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#F5C842" stroke="#F5C842" strokeWidth="1" style={{ flexShrink: 0 }}><path d="M21 10V8H15V2H13V8H7V10L10 14V22H14V14L17 10Z"/></svg>
              )}
              <span style={{
                fontSize: '12px', fontWeight: isActive ? 700 : 600, color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
              }}>{chat.title}</span>

              {(hoveredChat === chat.id || isActive) && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0, animation: 'fadeUp .15s ease both' }}>
                    <button
                    onClick={(e) => { e.stopPropagation(); togglePinChat(chat.id); }}
                    title={chat.pinned ? 'Unpin' : 'Pin'}
                    style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      background: chat.pinned ? 'rgba(245,200,66,0.2)' : 'rgba(255,255,255,0.08)',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', transition: 'all .15s',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={chat.pinned ? "#F5C842" : "none"} stroke={chat.pinned ? "#F5C842" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8H15V2H13V8H7V10L10 14V22H14V14L17 10Z"/></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    title="Delete"
                    style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      background: 'rgba(255,107,74,0.12)', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', transition: 'all .15s',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User profile at bottom */}
      <div
        onClick={() => navigate('/profile')}
        style={{
        margin: '12px 10px 0', padding: '10px 12px', borderRadius: '14px',
        background: path === '/profile' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
        border: path === '/profile' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, cursor: 'pointer', transition: 'all .2s'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B4A, #F5C842)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: '#0D1B3E', flexShrink: 0, textTransform: 'uppercase',
        }}>{user?.name?.[0] || 'U'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', lineHeight: 1, textTransform: 'capitalize' }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'capitalize' }}>{user?.role || 'Guest'}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Log Out" style={{
          background: 'rgba(255,107,74,0.08)', border: '1px solid rgba(255,107,74,0.2)', cursor: 'pointer',
          fontSize: '11px', fontWeight: 800, color: '#FF6B4A', transition: 'all .2s', padding: '8px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,107,74,0.15)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,107,74,0.08)';}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  );
}