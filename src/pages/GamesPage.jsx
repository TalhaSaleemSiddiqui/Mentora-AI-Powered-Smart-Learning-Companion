import React, { useState } from 'react';
import PageBackground from '../components/PageBackground';
import { playPop } from '../utils/sounds';

const GAMES = [
  {
    id: 'addition',
    name: 'Math Space Shooter',
    emoji: '🚀',
    sign: '➕',
    desc: 'Pilot your ship and blast the asteroid with the correct sum!',
    color: '#FF6B4A',
    gradient: 'linear-gradient(135deg, #FF6B4A, #e85530)',
    url: '/Final_Games/addition_space_shooter.html',
    difficulty: 'Easy',
  },
  {
    id: 'subtraction',
    name: 'Subtraction Snake',
    emoji: '🐍',
    sign: '➖',
    desc: 'Grow your snake by eating the right subtraction answers!',
    color: '#F5C842',
    gradient: 'linear-gradient(135deg, #F5C842, #e0b130)',
    url: '/Final_Games/subtraction_snake.html',
    difficulty: 'Easy',
  },
  {
    id: 'multiplication',
    name: 'Multiplication Blitz',
    emoji: '🌌',
    sign: '✖️',
    desc: 'Match tiles fast in this arcade-style multiplication challenge!',
    color: '#3DD9C5',
    gradient: 'linear-gradient(135deg, #3DD9C5, #2bbcaa)',
    url: '/Final_Games/Multiplication.html',
    difficulty: 'Medium',
  },
  {
    id: 'division',
    name: 'Pizza Party Split',
    emoji: '🍕',
    sign: '➗',
    desc: 'Slice pizzas evenly and master division with Chef Mentora!',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    url: '/Final_Games/pizza_party_split_v3.html',
    difficulty: 'Medium',
  },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);

  if (activeGame) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#0a0a1a' }}>
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 210,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '10px 18px',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: '"Nunito", sans-serif',
          }}
        >
          ← Back to Games
        </button>
        <iframe
          title={activeGame.name}
          src={activeGame.url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="microphone"
        />
      </div>
    );
  }

  return (
    <PageBackground style={{ overflowY: 'auto' }}>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '40px 28px 60px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '56px', marginBottom: '12px',
            animation: 'floatIcon 3s ease-in-out infinite',
          }}>🕹️</div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800, color: 'white', marginBottom: '8px', lineHeight: 1.2,
          }}>
            Game <span style={{
              background: 'linear-gradient(135deg,  #fff649ff, #3DD9C5)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Arcade</span>
          </h1>
          <p style={{
            fontSize: '15px', fontWeight: 600,
            color: 'rgba(255,255,255,0.5)', maxWidth: '500px',
          }}>
            Master math through epic adventures! Each game trains a different skill.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px', maxWidth: '960px', width: '100%',
        }}>
          {GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => { playPop(); setActiveGame(game); }}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              style={{
                position: 'relative', overflow: 'hidden',
                background: 'rgba(28,45,86,0.55)', backdropFilter: 'blur(20px)',
                border: `2px solid ${hoveredGame === game.id ? `${game.color}50` : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '28px', padding: '32px 28px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                transform: hoveredGame === game.id ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: hoveredGame === game.id ? `0 16px 40px ${game.color}20` : '0 8px 24px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: hoveredGame === game.id ? '80%' : '40%',
                height: '3px', background: game.gradient,
                borderRadius: '0 0 4px 4px',
                transition: 'width 0.3s ease',
                opacity: hoveredGame === game.id ? 1 : 0.5,
              }} />

              <div style={{
                position: 'absolute', right: '-10px', bottom: '-20px',
                fontSize: '120px', opacity: hoveredGame === game.id ? 0.08 : 0.04,
                transition: 'opacity 0.3s', pointerEvents: 'none',
              }}>{game.emoji}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: `${game.color}18`, border: `2px solid ${game.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '30px',
                  transition: 'all 0.3s',
                  transform: hoveredGame === game.id ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                }}>{game.emoji}</div>
                <div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 800, color: 'white', lineHeight: 1.2,
                  }}>{game.name}</div>
                  <div style={{
                    fontSize: '11px', fontWeight: 800, color: game.color,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{game.sign} {game.difficulty}</div>
                </div>
              </div>

              <div style={{
                fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.55)', lineHeight: 1.5,
                position: 'relative', zIndex: 1,
              }}>{game.desc}</div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '100px',
                background: `${game.color}15`, border: `1.5px solid ${game.color}30`,
                fontSize: '13px', fontWeight: 800, color: game.color,
                transition: 'all 0.3s',
                transform: hoveredGame === game.id ? 'translateX(4px)' : 'translateX(0)',
                alignSelf: 'flex-start',
              }}>
                Play Now →
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageBackground>
  );
}
