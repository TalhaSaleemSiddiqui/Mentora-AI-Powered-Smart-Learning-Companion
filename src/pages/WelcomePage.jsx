import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageBackground from '../components/PageBackground';
import { playPop } from '../utils/sounds';

const tiles = [
  {
    id: 'interaction',
    name: 'Interaction Mode',
    imgSrc: '/mascot.png',
    color: '#FF6B4A',
    gradient: 'linear-gradient(135deg, #FF6B4A 0%, #e85530 100%)',
    glow: 'rgba(255,107,74,0.25)',
    desc: 'Chat with Mentora, ask math questions, and explore at your own pace!',
    route: '/extra'
  },
  {
    id: 'learning',
    name: 'Learning Mode',
    emoji: '📚', 
    color: '#3DD9C5',
    gradient: 'linear-gradient(135deg, #3DD9C5 0%, #2bbcaa 100%)',
    glow: 'rgba(61,217,197,0.25)',
    desc: 'Follow structured lessons, complete quizzes, and level up your math skills!',
    route: '/'
  }
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [show, setShow] = useState(false);
  const [tileShow, setTileShow] = useState([false, false]);
  const [hoveredTile, setHoveredTile] = useState(null);

  // Video Overlay State
  const [showIntroVideo, setShowIntroVideo] = useState(!sessionStorage.getItem('mentora_welcomed'));
  
  
  const overlayRef = useRef(null);

  
  useEffect(() => {
    if (showIntroVideo && overlayRef.current) {
      
      overlayRef.current.requestFullscreen().catch(err => {
        console.warn("Fullscreen blocked by browser (usually needs a click first):", err);
      });
    }
  }, [showIntroVideo]);

  
  const handleVideoEnd = () => {
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.warn(err));
    }
    
    setShowIntroVideo(false);
    sessionStorage.setItem('mentora_welcomed', 'true');
  };

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && showIntroVideo) {
        handleVideoEnd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIntroVideo]);

  // UI Animations
  useEffect(() => {
    if (showIntroVideo) return; 

    const t1 = setTimeout(() => setShow(true), 100);
    const tileTimers = tiles.map((_, i) =>
      setTimeout(() => {
        setTileShow(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 500 + i * 150) 
    );

    return () => {
      clearTimeout(t1);
      tileTimers.forEach(clearTimeout);
    };
  }, [showIntroVideo]);

  const handleTileClick = (route) => {
    playPop();
    navigate(route);
  };

  return (
    <>
      {/* FULL SCREEN VIDEO OVERLAY */}
      {showIntroVideo && (
        <div 
          ref={overlayRef} 
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <video
            src="/mentora.mp4"
            autoPlay
            playsInline
            onEnded={handleVideoEnd} 
            
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* NORMAL WELCOME PAGE */}
      <PageBackground style={{ overflowY: 'auto' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 28px 60px', position: 'relative',
        }}>
          {/* Background Orbs */}
          <div style={{
            position: 'absolute', top: '10%', left: '15%',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(61,217,197,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)', animation: 'floatIcon 8s ease-in-out infinite', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', right: '10%',
            width: '350px', height: '350px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,74,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)', animation: 'floatIcon 10s ease-in-out infinite reverse', pointerEvents: 'none',
          }} />

          
          <div style={{
            width: '90%',           
            maxWidth: '650px',      
            height: '350px',        
            marginBottom: '40px',
            borderRadius: '28px',  
            border: '1.5px solid #fcea86ff', 
            boxShadow: '0 15px 40px rgba(215, 222, 74, 0.4)',
            opacity: show ? 1 : 0,
            transform: show ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(-20px)',
            transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.4s',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'rgba(28,45,86,0.4)' 
          }}>
            <img 
              src="/welcome.png" 
              alt="Middle Pic"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover' 
              }}
            />
          </div>
          {/* Welcome Text */}
          <div style={{
            fontSize: '24px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '32px',
            opacity: show ? 1 : 0, transition: 'opacity 0.8s ease 0.3s', zIndex: 10
          }}>
            What would you like to do today, {user?.name || 'Student'}? 🎯
          </div>
         
          {/* 2 Big Topic Tiles Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px', maxWidth: '800px', width: '100%', padding: '0 16px', zIndex: 10
          }}>
            {tiles.map((tile, i) => (
              <div
                key={tile.id}
                onClick={() => handleTileClick(tile.route)}
                onMouseEnter={() => setHoveredTile(i)}
                onMouseLeave={() => setHoveredTile(null)}
                style={{
                  background: 'rgba(28,45,86,0.55)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,0.08)',
                  padding: '40px 32px', borderRadius: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: tileShow[i] ? (hoveredTile === i ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)') : 'translateY(40px) scale(0.9)',
                  opacity: tileShow[i] ? 1 : 0,
                  boxShadow: hoveredTile === i ? `0 12px 40px ${tile.glow}` : 'none'
                }}
              >
                {/* Background Watermark */}
                <div style={{
                  position: 'absolute', right: '-15px', bottom: '-20px', fontSize: '120px',
                  opacity: hoveredTile === i ? 0.08 : 0.03, transition: 'opacity 0.3s ease', pointerEvents: 'none',
                }}>
                  {tile.imgSrc ? (
                    <img src={tile.imgSrc} alt="" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
                  ) : (
                    tile.emoji
                  )}
                </div>

                {/* Top Gradient Line */}
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: hoveredTile === i ? '80%' : '40%', height: '4px', background: tile.gradient,
                  borderRadius: '0 0 6px 6px', transition: 'width 0.3s ease', opacity: hoveredTile === i ? 1 : 0.5,
                }} />

                {/* Main Icon Box */}
                <div style={{
                  width: '80px', height: '80px', borderRadius: '24px', background: `${tile.color}15`, border: `2px solid ${tile.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '20px',
                  transition: 'all 0.3s ease', transform: hoveredTile === i ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                }}>
                  {tile.imgSrc ? (
                    <img src={tile.imgSrc} alt={tile.name} style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                  ) : (
                    tile.emoji
                  )}
                </div>

                <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                  {tile.name}
                </div>

                <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: '24px' }}>
                  {tile.desc}
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px',
                  background: `${tile.color}15`, border: `1px solid ${tile.color}30`, fontSize: '14px', fontWeight: 800, color: tile.color,
                  transition: 'all 0.3s ease', transform: hoveredTile === i ? 'translateX(6px)' : 'translateX(0)',
                }}>
                  Start Mode →
                </div>
              </div>
            ))}
          </div>

        </div>
      </PageBackground>
    </>
  );
}