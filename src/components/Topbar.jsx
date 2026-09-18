export default function Topbar({ title, subtitle, showStreak = true, titleColor = "var(--white)" }) {
  return (
    <div className="topbar anim-1" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '24px 40px 0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="topbar-left" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div className="greeting" style={{ fontFamily: '"Baloo 2", cursive', fontSize: '28px', fontWeight: '800', color: titleColor, lineHeight: 1.2 }}>
          {title}
        </div>
        {subtitle && <div className="subgreeting">{subtitle}</div>}
      </div>
      
      {showStreak && (
        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="streak-badge">
            <span className="fire">🔥</span>
            <div>
              <div className="streak-text">12 Day Streak</div>
              <div className="streak-sub">Keep it going!</div>
            </div>
          </div>
          <div className="notif-btn">
            🔔<div className="notif-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
}
