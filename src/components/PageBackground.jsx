/**
 * PageBackground — shared background used across all pages.
 * Provides animated background: glowing orbs, twinkling stars, floating math symbols, and shimmer streaks.
 */
import { useMemo } from 'react';

const SYMBOLS = ['+','×','÷','=','²','−','π','∞','%','√','≈','!'];
const COLORS = ['#FF6B4A','#3DD9C5','#F5C842','#a78bfa','#FF6B4A','#3DD9C5'];

export default function PageBackground({ children, style = {} }) {
  // Pre-compute random values on mount with useMemo so they don't re-randomize on re-render
  const stars = useMemo(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2,
      dur: 2 + Math.random() * 4,
      del: Math.random() * 5,
    })), []);
  
  const symbols = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      s: SYMBOLS[i % SYMBOLS.length],
      x: 3 + Math.random() * 94,
      y: 2 + Math.random() * 96,
      size: 10 + Math.random() * 14,
      color: COLORS[i % COLORS.length],
      spd: 3 + Math.random() * 4,
      del: Math.random() * 3,
      opacity: 0.06 + Math.random() * 0.09,
    })), []);
  
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      w: 1 + Math.random() * 2,
      h: 20 + Math.random() * 60,
      color: COLORS[i % COLORS.length],
      dur: 4 + Math.random() * 8,
      del: Math.random() * 6,
    })), []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100%',
      background: 'linear-gradient(160deg, #080f2a 0%, #0D1B3E 45%, #0f1d42 100%)',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      {/* Injected keyframes */}
      <style>{`
        @keyframes pgTwinkle { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes pgFloat { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes pgRise { 0%{opacity:0;transform:translateY(0)} 15%{opacity:0.6} 85%{opacity:0.6} 100%{opacity:0;transform:translateY(-80px)} }
        @keyframes pgOrbDrift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} }
        @keyframes pgOrbDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,25px) scale(1.08)} }
        @keyframes pgOrbDrift3 { 0%,100%{transform:translate(0,0) scale(1.05)} 50%{transform:translate(15px,15px) scale(0.95)} }
        @keyframes pgShimmer { 0%{opacity:0;transform:translateY(100vh)} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0;transform:translateY(-100vh)} }
        @keyframes fadeIn {from{opacity:0}to{opacity:1}}
      `}</style>

      {/* === LAYER 0: Rich gradient base === */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255,107,74,0.16) 0%, transparent 65%),
          radial-gradient(ellipse 55% 50% at 3%  0%,   rgba(61,217,197,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 50% 45% at 97% 8%,   rgba(245,200,66,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 80% 90%,  rgba(167,139,250,0.08) 0%, transparent 55%)
        `,
      }} />

      {/* === LAYER 1: Animated glowing orbs === */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Orb 1 - coral */}
        <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,74,0.09) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'pgOrbDrift 12s ease-in-out infinite' }} />
        {/* Orb 2 - teal */}
        <div style={{ position: 'absolute', bottom: '-100px', left: '-80px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,217,197,0.08) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'pgOrbDrift2 14s ease-in-out infinite' }} />
        {/* Orb 3 - gold */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'pgOrbDrift3 10s ease-in-out infinite' }} />
        {/* Orb 4 - purple */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'pgOrbDrift 18s ease-in-out infinite reverse' }} />
      </div>

      {/* === LAYER 2: Twinkling star field === */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {stars.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            borderRadius: '50%',
            background: 'white',
            animation: `pgTwinkle ${s.dur}s ${s.del}s ease-in-out infinite`,
            opacity: 0,
          }} />
        ))}
      </div>

      {/* === LAYER 3: Floating math symbols === */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {symbols.map(f => (
          <span key={f.id} style={{
            position: 'absolute',
            fontFamily: '"Baloo 2", cursive',
            fontWeight: 800,
            fontSize: `${f.size}px`,
            color: f.color,
            opacity: f.opacity,
            left: `${f.x}%`,
            top: `${f.y}%`,
            animation: `pgFloat ${f.spd}s ${f.del}s ease-in-out infinite`,
            userSelect: 'none',
          }}>{f.s}</span>
        ))}
      </div>

      {/* === LAYER 4: Vertical shimmer streaks === */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-10%',
            width: `${p.w}px`,
            height: `${p.h}px`,
            borderRadius: '100px',
            background: `linear-gradient(to top, transparent, ${p.color}55, transparent)`,
            animation: `pgShimmer ${p.dur}s ${p.del}s ease-in-out infinite`,
            opacity: 0,
          }} />
        ))}
      </div>

      {/* === Page content === */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
