import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface EndOverlayProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const EndOverlay: React.FC<EndOverlayProps> = ({ score, highScore, onRestart }) => {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleRestart = () => {
    // restore before restarting
    document.body.style.overflow = '';
    onRestart();
  };

  const node = (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 200000,
      color: '#FFFFFF',
      fontFamily: 'Courier New, monospace'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '24px 32px',
        border: '2px solid #FF0000',
        borderRadius: '10px',
        background: 'rgba(0,0,0,0.95)',
        minWidth: '320px'
      }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#FF5555' }}>GAME OVER</h2>
        <div style={{ marginTop: '16px', fontSize: '16px' }}>SCORE</div>
        <div style={{ fontSize: '24px', color: '#FFFF00', fontWeight: 700 }}>{score.toLocaleString()}</div>
        <div style={{ marginTop: '12px', fontSize: '16px' }}>HIGH SCORE</div>
        <div style={{ fontSize: '24px', color: '#FF6B6B', fontWeight: 700 }}>{highScore.toLocaleString()}</div>
        <button
          onClick={handleRestart}
          style={{
            marginTop: '20px',
            padding: '10px 16px',
            borderRadius: '6px',
            border: '2px solid #FFFF00',
            background: 'transparent',
            color: '#FFFF00',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          RESTART
        </button>
      </div>
    </div>
  );
  return createPortal(node, document.body);
};

export default EndOverlay;
