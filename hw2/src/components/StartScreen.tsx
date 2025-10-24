import React, { useState, useEffect } from 'react';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [buttonScale, setButtonScale] = useState(1);
  const [buttonGlow, setButtonGlow] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Play Game Start.mp3 once when component mounts
  useEffect(() => {
    const audio = new Audio('/01. Game Start.mp3');
    audio.volume = 0.7;
    audio.preload = 'auto';
    
    // Try to play audio with user interaction
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.log('Audio play failed:', error);
        // Try again after a short delay
        setTimeout(() => {
          audio.play().catch(err => console.log('Retry audio play failed:', err));
        }, 100);
      }
    };
    
    // Play immediately and also on first user interaction
    playAudio();
    
    const handleUserInteraction = () => {
      playAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Blooming animation for the button
  useEffect(() => {
    const interval = setInterval(() => {
      setButtonGlow(prev => (prev + 0.02) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Button hover animation
  useEffect(() => {
    if (isHovered) {
      setButtonScale(1.1);
    } else {
      setButtonScale(1);
    }
  }, [isHovered]);

  const handleButtonClick = () => {
    // Add click animation
    setButtonScale(0.95);
    setTimeout(() => {
      setButtonScale(1.1);
      setTimeout(() => {
        onStartGame();
      }, 200);
    }, 100);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/start.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Overlay for better text visibility */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }} />


      {/* Animated Start Button */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        animation: 'fadeInUp 1s ease-out 0.5s both',
        marginTop: '20vh'
      }}>
        <button
          onClick={handleButtonClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'relative',
            padding: '20px 50px',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
            border: '3px solid #FFD700',
            borderRadius: '50px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            transform: `scale(${buttonScale})`,
            transition: 'all 0.3s ease',
            boxShadow: `
              0 0 20px rgba(255, 215, 0, ${0.5 + Math.sin(buttonGlow) * 0.3}),
              0 0 40px rgba(255, 215, 0, ${0.3 + Math.sin(buttonGlow) * 0.2}),
              inset 0 0 20px rgba(255, 215, 0, ${0.2 + Math.sin(buttonGlow) * 0.1})
            `,
            background: `
              linear-gradient(45deg, 
                rgba(255, 215, 0, ${0.1 + Math.sin(buttonGlow) * 0.05}) 0%,
                rgba(255, 255, 255, ${0.05 + Math.sin(buttonGlow) * 0.02}) 50%,
                rgba(255, 215, 0, ${0.1 + Math.sin(buttonGlow) * 0.05}) 100%
              )
            `
          }}
        >
          START GAME
          
          {/* Blooming effect particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: `
                  translate(-50%, -50%) 
                  rotate(${i * 45}deg) 
                  translateY(-60px) 
                  scale(${0.5 + Math.sin(buttonGlow + i * 0.5) * 0.5})
                `,
                opacity: 0.3 + Math.sin(buttonGlow + i * 0.5) * 0.4,
                transition: 'all 0.1s ease'
              }}
            />
          ))}
        </button>
      </div>


      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default StartScreen;
