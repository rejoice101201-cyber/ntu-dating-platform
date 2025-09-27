import { useState } from 'react';

interface Props { open: boolean; onClose: () => void; }

const SHORT_RULES = [
  '🎯 OBJECTIVE: Eat all pac-dots to clear the maze and advance to the next level.',
  '👻 GHOSTS: Blinky (red) is most aggressive, Pinky (pink) ambushes ahead, Inky (cyan) is unpredictable, Clyde (orange) sometimes retreats.',
  '💊 POWER PELLETS: Located in corners, turn ghosts blue for 1-7 seconds, allowing you to eat them for 200 points each.',
  '🍒 FRUITS: Appear periodically for bonus points (100-5000 points). Cherry (100), Strawberry (300), Orange (500), Apple (700), Melon (1000), Galaxian (2000), Bell (3000), Key (5000).',
  '🎮 CONTROLS: Arrow keys (↑↓←→) or WASD - Pac-Man moves automatically, you only control direction! Press Q to pause, then SPACE to resume or R to restart.',
  '💡 SCORING: Pac-dots (10 pts), Power pellets (50 pts), Blue ghosts (200 pts), Fruits (100-5000 pts).',
  '❤️ LIVES: Start with 3 lives, earn extra life at 10,000 points.',
  '🏃 MOVEMENT: Use tunnels on left/right edges to escape or ambush ghosts.',
  '⚡ DIFFICULTY: Each level increases speed and shortens frightened duration.',
];

export function ModalRules({ open, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Pac-Man Rules" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0b0b1a', color: '#ffe6a1', padding: 16, maxWidth: 640, width: '90%', border: '1px solid #243' }}>
        <h2 style={{ marginTop: 0 }}>Pac‑Man Rules</h2>
        <ul>
          {SHORT_RULES.map(r => (<li key={r}>{r}</li>))}
        </ul>
        <button onClick={() => setExpanded(s => !s)} aria-expanded={expanded} aria-controls="full-rules" style={{ marginRight: 8 }}>Read more</button>
        <button onClick={onClose} autoFocus>Close</button>
        {expanded && (
          <div id="full-rules" style={{ marginTop: 12, color: '#cfe' }}>
            <h3>Advanced Strategy Tips:</h3>
            <ul>
              <li><strong>Pattern Recognition:</strong> Learn ghost movement patterns to predict their behavior.</li>
              <li><strong>Tunnel Usage:</strong> Use side tunnels strategically to escape or ambush ghosts.</li>
              <li><strong>Power Pellet Timing:</strong> Save power pellets for when multiple ghosts are nearby.</li>
              <li><strong>Corner Strategy:</strong> Use corners to change direction quickly and confuse ghosts.</li>
              <li><strong>Fruit Collection:</strong> Collect fruits when safe to maximize bonus points.</li>
            </ul>
            <p><strong>Ghost Personalities:</strong> Blinky (red) directly chases, Pinky (pink) tries to cut you off, Inky (cyan) uses complex patterns, Clyde (orange) retreats when close.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalRules;


