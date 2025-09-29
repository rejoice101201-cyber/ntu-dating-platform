import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface GameAnimationsProps {
  type: 'start' | 'pause' | 'end' | 'levelComplete';
  onComplete?: () => void;
}

const GameAnimations: React.FC<GameAnimationsProps> = ({ type, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300); // Very short animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Dismiss animation immediately on any key press
  useEffect(() => {
    const handleKeyPress = () => {
      setIsVisible(false);
      onComplete?.();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('mousedown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mousedown', handleKeyPress);
    };
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const getAnimationContent = () => {
    switch (type) {
      case 'start':
        return {
          title: 'GAME START!',
          color: '#00FF00',
          bgColor: 'rgba(0, 255, 0, 0.1)'
        };
      case 'pause':
        return {
          title: 'PAUSED',
          color: '#FFD700',
          bgColor: 'rgba(255, 215, 0, 0.1)'
        };
      case 'end':
        return {
          title: 'GAME OVER',
          color: '#FF0000',
          bgColor: 'rgba(255, 0, 0, 0.1)'
        };
      case 'levelComplete':
        return {
          title: 'LEVEL COMPLETE!',
          color: '#00FFFF',
          bgColor: 'rgba(0, 255, 255, 0.1)'
        };
      default:
        return {
          title: '',
          color: '#FFFFFF',
          bgColor: 'rgba(255, 255, 255, 0.1)'
        };
    }
  };

  const { title, color, bgColor } = getAnimationContent();

  if (!isVisible) return null;

  const node = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: bgColor,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      animation: 'fadeInOut 2s ease-in-out'
    }}>
      <div style={{
        textAlign: 'center',
        animation: `pulse${animationPhase} 0.2s ease-in-out`
      }}>
        <h1 style={{
          fontSize: '5rem',
          fontWeight: 'bold',
          color: color,
          textShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          margin: 0,
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          animation: 'glow 0.5s ease-in-out infinite alternate'
        }}>
          {title}
        </h1>
        
        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              backgroundColor: color,
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: `
                translate(-50%, -50%) 
                rotate(${i * 30}deg) 
                translateY(-100px) 
                scale(${0.5 + Math.sin(Date.now() * 0.01 + i * 0.5) * 0.5})
              `,
              opacity: 0.6 + Math.sin(Date.now() * 0.01 + i * 0.5) * 0.4,
              animation: `orbit${i} 2s linear infinite`
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes glow {
          from {
            text-shadow: 0 0 20px ${color}, 0 0 40px ${color};
          }
          to {
            text-shadow: 0 0 30px ${color}, 0 0 60px ${color}, 0 0 80px ${color};
          }
        }
        
        @keyframes pulse0 {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes pulse1 {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes pulse2 {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
        
        ${[...Array(12)].map((_, i) => `
          @keyframes orbit${i} {
            0% {
              transform: translate(-50%, -50%) rotate(${i * 30}deg) translateY(-100px) rotate(-${i * 30}deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(${i * 30 + 360}deg) translateY(-100px) rotate(-${i * 30 + 360}deg);
            }
          }
        `).join('')}
      `}</style>
    </div>
  );

  return createPortal(node, document.body);
};

export default GameAnimations;
