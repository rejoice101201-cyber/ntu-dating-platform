import { useEffect, useState } from 'react'
import './App.css'
import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import ModalRules from './components/ModalRules'
import { HighScoreManager } from './utils/HighScoreManager'

function App() {
  const [openRules, setOpenRules] = useState(false)
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(HighScoreManager.getHighScore())
  const [lives, setLives] = useState(3)
  const [level] = useState(1)

  useEffect(() => {
    if (!localStorage.getItem('pacman_rules_seen')) {
      setOpenRules(true)
      localStorage.setItem('pacman_rules_seen', '1')
    }
  }, [])

  return (
    <div style={{ 
      height: '100vh',
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%',
        maxWidth: '500px',
        marginBottom: '10px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px',
          color: '#FFFF00',
          fontFamily: 'Courier New, monospace',
          fontWeight: 'bold'
        }}>PAC-MAN</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setOpenRules(true)} 
            aria-label="Open Pac-Man rules"
            style={{
              background: 'transparent',
              border: '2px solid #FFFFFF',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '4px',
              fontFamily: 'Courier New, monospace',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            RULES
          </button>
          <a 
            href="https://github.com/" 
            target="_blank" 
            rel="noreferrer"
            style={{
              background: 'transparent',
              border: '2px solid #FFFFFF',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '4px',
              fontFamily: 'Courier New, monospace',
              fontSize: '12px',
              fontWeight: 'bold',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            SOURCE
          </a>
        </div>
      </header>
      <HUD score={score} highScore={high} lives={lives} level={level} />
      <GameCanvas 
        onScoreChange={setScore}
        onHighChange={setHigh}
        onLivesChange={setLives}
      />
      <ModalRules open={openRules} onClose={() => setOpenRules(false)} />
    </div>
  )
}

export default App