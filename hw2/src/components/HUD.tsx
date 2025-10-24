// No React import needed with JSX transform

interface Props {
  score: number;
  highScore: number;
  lives: number;
  level: number;
}

export function HUD({ score, highScore, lives, level }: Props) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: '500px',
      color: '#FFFF00', 
      fontFamily: 'Courier New, monospace',
      fontSize: '18px',
      fontWeight: 'bold',
      padding: '8px 16px',
      background: 'rgba(0,0,0,0.8)',
      borderRadius: '6px',
      border: '2px solid #0080FF'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '14px' }}>SCORE</div>
        <div style={{ fontSize: '16px', color: '#FFFFFF' }}>{score.toString().padStart(6, '0')}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '14px' }}>LIVES</div>
        <div style={{ fontSize: '16px', color: '#FFFFFF' }}>{lives}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '14px' }}>HIGH</div>
        <div style={{ fontSize: '16px', color: '#FFFFFF' }}>{highScore.toString().padStart(6, '0')}</div>
      </div>
    </div>
  );
}

export default HUD;


