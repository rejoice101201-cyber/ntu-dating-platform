import { useCallback, useEffect, useRef, useState } from 'react';
import { createDefaultTilemap } from '../game/tilemap';
import { createInitialGameState, createLevelConfig, createPacman, createGhost, moveEntity, updateGhostModes, updateGhostDirections, handleConsumables, updatePacmanDirection, updateLevelSpeeds, aabbIntersect, TILE_SIZE } from '../game/engine';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyControls } from '../hooks/useKeyControls';
import type { Ghost, Pacman } from '../types/GameTypes';
import { HighScoreManager } from '../utils/HighScoreManager';
import { soundManager } from '../utils/SoundManager';
import PacManAnimated from './PacManAnimated';
import StartScreen from './StartScreen';
import GameAnimations from './GameAnimations';
import EndOverlay from './EndOverlay';

interface GameCanvasProps {
  onScoreChange?: (score: number) => void;
  onHighChange?: (high: number) => void;
  onLivesChange?: (lives: number) => void;
}

// Game constants
const PACMAN_SPAWN_COL = 14;
const PACMAN_SPAWN_ROW = 23;
const GHOST_POSITIONS = [
  { col: 14, row: 14 }, // blinky
  { col: 13, row: 14 }, // pinky
  { col: 15, row: 14 }, // inky
  { col: 14, row: 14 }, // clyde
];

// Score constants
const DOT_SCORE = 10;
const POWER_PELLET_SCORE = 50;
const GHOST_SCORE = 200;
const EXTRA_LIFE_SCORE = 10000;

export function GameCanvas({ onScoreChange, onHighChange, onLivesChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const infoPanelRef = useRef<HTMLDivElement | null>(null);
  const gameOuterRef = useRef<HTMLDivElement | null>(null);
  const [tilemap, setTilemap] = useState(() => createDefaultTilemap(TILE_SIZE));
  const [state, setState] = useState(() => ({ ...createInitialGameState(), running: false, paused: false }));
  const [showStart, setShowStart] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [level, setLevel] = useState(() => createLevelConfig(1));
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showGameAnimation, setShowGameAnimation] = useState<'start' | 'pause' | 'end' | 'levelComplete' | null>(null);
  const [intermissionAudio, setIntermissionAudio] = useState<HTMLAudioElement | null>(null);
  const [scale, setScale] = useState(1);
  const overlayActive = showStartScreen || showStart || gameOver || gameWon || state.paused || showLevelTransition || !!showGameAnimation;
  
  // Handle start screen
  const handleStartGame = () => {
    setShowStartScreen(false);
    setState(prev => ({ ...prev, running: true }));
  };

  // Handle game animations
  const handleAnimationComplete = () => {
    setShowGameAnimation(null);
  };

  // Initialize intermission audio
  useEffect(() => {
    const audio = new Audio('/02. Intermission.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    setIntermissionAudio(audio);
  }, []);

  // Responsive scaling to fit viewport
  useEffect(() => {
    const updateScale = () => {
      const gameWidth = tilemap.cols * tilemap.tileSize;
      const gameHeight = tilemap.rows * tilemap.tileSize;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const sidePanelWidth = infoPanelRef.current?.offsetWidth ?? 220; // fallback
      const horizontalGaps = 30 + 240; // gap between columns + left spacer
      const availableWidth = Math.max(0, vw - sidePanelWidth - horizontalGaps - 40); // a bit of padding

      const scaleByWidth = availableWidth / gameWidth;
      const scaleByHeight = (vh - 40) / gameHeight; // top/bottom padding

      const newScale = Math.min(1, Math.max(0.1, Math.min(scaleByWidth, scaleByHeight)));
      setScale(isFinite(newScale) ? newScale : 1);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [tilemap]);

  // Helper function to create game entities
  const createGameEntities = useCallback((tilemap: any, level: any) => {
    const pacman = createPacman(PACMAN_SPAWN_COL, PACMAN_SPAWN_ROW, tilemap.tileSize, level);
    const ghosts = [
      createGhost('blinky', GHOST_POSITIONS[0].col, GHOST_POSITIONS[0].row, tilemap.tileSize, level, tilemap.cols, tilemap.rows),
      createGhost('pinky', GHOST_POSITIONS[1].col, GHOST_POSITIONS[1].row, tilemap.tileSize, level, tilemap.cols, tilemap.rows),
      createGhost('inky', GHOST_POSITIONS[2].col, GHOST_POSITIONS[2].row, tilemap.tileSize, level, tilemap.cols, tilemap.rows),
      createGhost('clyde', GHOST_POSITIONS[3].col, GHOST_POSITIONS[3].row, tilemap.tileSize, level, tilemap.cols, tilemap.rows),
    ];
    return { pacman, ghosts };
  }, []);
  
  const [pacman, setPacman] = useState<Pacman>(() => createGameEntities(tilemap, level).pacman);
  const [ghosts, setGhosts] = useState<Ghost[]>(() => createGameEntities(tilemap, level).ghosts);
  const input = useKeyControls();

  useEffect(() => { updateLevelSpeeds(pacman, ghosts, level, tilemap.tileSize, isPowerMode); }, [level, isPowerMode]);

  // Pac-Man starts moving immediately with the correct speed set in createPacman

  useEffect(() => { soundManager.init(); }, []);

  const step = useCallback((deltaMs: number) => {
    setState(currentState => {
      // Handle pause toggle (Q key)
      if (input.pause && !currentState.paused) {
        setShowGameAnimation('pause');
        return { ...currentState, paused: true };
      }
      
      // Handle pause menu controls
      if (currentState.paused) {
        if (input.space) {
          // Stop intermission audio
          if (intermissionAudio) {
            intermissionAudio.pause();
            intermissionAudio.currentTime = 0;
          }
          return { ...currentState, paused: false };
        }
        if (input.restart) {
          // Stop intermission audio
          if (intermissionAudio) {
            intermissionAudio.pause();
            intermissionAudio.currentTime = 0;
          }
          // Reset game and exit pause
          resetGame();
          return { ...currentState, paused: false };
        }
        return currentState; // Stay paused
      }
      
      if (!currentState.running) return currentState;

      // Pacman input and movement - constant speed, turn when possible
      updatePacmanDirection(pacman, input, tilemap);
      moveEntity(pacman, deltaMs, tilemap);

      // Ghost logic
      updateGhostModes(ghosts, deltaMs, level);
      updateGhostDirections(ghosts, pacman, tilemap, performance.now());
      // Update ghost speeds based on their current mode
      updateLevelSpeeds(pacman, ghosts, level, tilemap.tileSize, isPowerMode);
      ghosts.forEach(g => moveEntity(g, deltaMs, tilemap));

      // Collisions: dots
      const ate = handleConsumables(pacman, tilemap);
      if (ate === 'dot') {
        currentState.score.score += DOT_SCORE; soundManager.playSfx('munch');
        onScoreChange?.(currentState.score.score);
        
        // Check for Blinky's Cruise Elroy state (when 75% of dots are eaten)
        const dotsEaten = currentState.score.score / DOT_SCORE; // Each dot is 10 points
        const dotsRemaining = tilemap.cells.filter(cell => cell.dot || cell.powerPellet).length;
        const totalDotsInLevel = dotsEaten + dotsRemaining;
        
        if (totalDotsInLevel > 0 && dotsEaten >= totalDotsInLevel * 0.75) {
          // Activate Blinky's Cruise Elroy state
          setGhosts(prevGhosts => 
            prevGhosts.map(ghost => {
              if (ghost.name === 'blinky' && !ghost.isCruiseElroy) {
                return { ...ghost, isCruiseElroy: true };
              }
              return ghost;
            })
          );
        }
      } else if (ate === 'power') {
        currentState.score.score += POWER_PELLET_SCORE; soundManager.playSfx('power');
        onScoreChange?.(currentState.score.score);
        // Set ghosts to frightened mode more efficiently
        ghosts.forEach(gh => { 
          if (gh.mode !== 'eyes') { // Don't affect ghosts in eyes mode
            gh.mode = 'frightened'; 
            gh.frightenedTimerMs = level.frightenedDurationMs; 
          }
        });
        // Enter power mode
        setIsPowerMode(true);
        // Update speeds immediately when mode changes
        updateLevelSpeeds(pacman, ghosts, level, tilemap.tileSize, true);
        
        // Exit power mode after frightened duration
        setTimeout(() => {
          setIsPowerMode(false);
        }, level.frightenedDurationMs);
      }

      // Check for win condition (all dots eaten)
      const dotsRemaining = tilemap.cells.filter(cell => cell.dot || cell.powerPellet).length;
      if (dotsRemaining === 0) {
        // Level completed - show transition and advance to next level
        currentState.running = false;
        setShowLevelTransition(true);
        setShowGameAnimation('levelComplete');
        
        // Update high score
        const newHighScore = HighScoreManager.setHighScore(currentState.score.score);
        if (newHighScore) {
          currentState.score.highScore = HighScoreManager.getHighScore();
        }
        onHighChange?.(HighScoreManager.getHighScore());
        
        soundManager.playSfx('extra'); // Play victory sound
        
        // Advance to next level after a short delay
        setTimeout(() => {
          const nextLevelNumber = level.levelNumber + 1;
          const newLevel = createLevelConfig(nextLevelNumber);
          setLevel(newLevel);
          
          // Update score level
          currentState.score.level = nextLevelNumber;
          
          // Reset game state for next level
          const newTilemap = createDefaultTilemap(TILE_SIZE);
          setTilemap(newTilemap);
          
          // Reset Pac-Man and ghosts for next level
          const { pacman: newPacman, ghosts: newGhosts } = createGameEntities(newTilemap, newLevel);
          setPacman(newPacman);
          setGhosts(newGhosts);
          
          // Reset power mode
          setIsPowerMode(false);
          
          // Hide transition and continue game
          setShowLevelTransition(false);
          setState(prev => ({ ...prev, running: true }));
        }, 2000); // 2 second transition
      }

      // Extra life
      if (!currentState.score.extraLifeAwarded && currentState.score.score >= EXTRA_LIFE_SCORE) {
        pacman.lives += 1; currentState.score.extraLifeAwarded = true; soundManager.playSfx('extra');
        onLivesChange?.(pacman.lives);
      }

      // Collisions: ghosts
      ghosts.forEach(g => {
        if (aabbIntersect(pacman, g)) {
          if (g.mode === 'frightened') {
            currentState.score.score += GHOST_SCORE; 
            g.previousMode = 'frightened'; // Remember it was frightened
            g.mode = 'eyes'; 
            g.frightenedTimerMs = level.eyesDurationMs; // Set eyes mode duration
            soundManager.playSfx('ghost');
            onScoreChange?.(currentState.score.score);
            // Update speed immediately when mode changes
            updateLevelSpeeds(pacman, ghosts, level, tilemap.tileSize, isPowerMode);
          } else if (g.mode !== 'eyes') {
            pacman.lives -= 1; soundManager.playSfx('death');
            onLivesChange?.(pacman.lives);
            if (pacman.lives <= 0) {
              currentState.running = false;
              setGameOver(true);
              setShowGameAnimation('end');
              console.log('[Game] Game Over triggered');
              // Play intermission audio on game over
              if (intermissionAudio) {
                intermissionAudio.play().catch(error => {
                  console.log('Intermission audio play failed:', error);
                });
              }
              const newHighScore = HighScoreManager.setHighScore(currentState.score.score);
              if (newHighScore) {
                currentState.score.highScore = HighScoreManager.getHighScore();
              }
              onHighChange?.(HighScoreManager.getHighScore());
            } else {
              // reset positions
              pacman.position = { x: PACMAN_SPAWN_COL * tilemap.tileSize + tilemap.tileSize / 2, y: PACMAN_SPAWN_ROW * tilemap.tileSize + tilemap.tileSize / 2 };
              ghosts.forEach((gh, i) => { 
                const pos = GHOST_POSITIONS[i] || GHOST_POSITIONS[0];
                gh.position = { x: pos.col * tilemap.tileSize + tilemap.tileSize / 2, y: pos.row * tilemap.tileSize + tilemap.tileSize / 2 };
              });
            }
          }
        }
      });

      // Only update state if there are actual changes
      setPacman(prevPacman => {
        if (prevPacman.position.x !== pacman.position.x || 
            prevPacman.position.y !== pacman.position.y ||
            prevPacman.direction !== pacman.direction ||
            prevPacman.lives !== pacman.lives) {
          return { ...pacman };
        }
        return prevPacman;
      });
      
      setGhosts(prevGhosts => {
        const hasChanges = prevGhosts.some((prevGhost, index) => {
          const currentGhost = ghosts[index];
          return prevGhost.position.x !== currentGhost.position.x ||
                 prevGhost.position.y !== currentGhost.position.y ||
                 prevGhost.direction !== currentGhost.direction ||
                 prevGhost.mode !== currentGhost.mode;
        });
        
        if (hasChanges) {
          return [...ghosts];
        }
        return prevGhosts;
      });
      
      return { ...currentState, score: { ...currentState.score } };
    });
  }, [pacman, ghosts, input, tilemap, level, intermissionAudio]);

  useGameLoop(step, state.running && !gameOver);

  // Reset game function
  const resetGame = useCallback(() => {
    // Ensure intermission audio stops on reset
    if (intermissionAudio) {
      intermissionAudio.pause();
      intermissionAudio.currentTime = 0;
    }
    setShowStart(true);
    setGameOver(false);
    setGameWon(false);
    setShowLevelTransition(false);
    const newState = { ...createInitialGameState(), running: false, paused: false };
    // Ensure high score is preserved from HighScoreManager
    newState.score.highScore = HighScoreManager.getHighScore();
    setState(newState);
    
    // Reset to level 1
    const level1 = createLevelConfig(1);
    setLevel(level1);
    
    const newTilemap = createDefaultTilemap(TILE_SIZE);
    setTilemap(newTilemap);
    const { pacman: newPacman, ghosts: newGhosts } = createGameEntities(newTilemap, level1);
    setPacman(newPacman);
    setGhosts(newGhosts);
    
    // Reset power mode
    setIsPowerMode(false);
  }, [createGameEntities, intermissionAudio]);

  // Start overlay: any key or click to start
  useEffect(() => {
    if (!showStart || gameOver) return;
    const start = () => { setShowStart(false); setState(s => ({ ...s, running: true })); };
    window.addEventListener('keydown', start, { once: true });
    window.addEventListener('mousedown', start, { once: true });
    return () => { window.removeEventListener('keydown', start); window.removeEventListener('mousedown', start); };
  }, [showStart, gameOver]);

  // Game over/win overlay: any key or click to restart
  useEffect(() => {
    if (!gameOver && !gameWon) return;
    const restart = () => { resetGame(); };
    window.addEventListener('keydown', restart, { once: true });
    window.addEventListener('mousedown', restart, { once: true });
    return () => { window.removeEventListener('keydown', restart); window.removeEventListener('mousedown', restart); };
  }, [gameOver, gameWon, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    
    let animationTime = 0;
    
    // Load map background image
    const mapImg = new Image();
    mapImg.src = '/map.png';
    
    const draw = () => {
      animationTime += 16.67; // ~60fps (1000ms / 60fps = 16.67ms per frame)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // maze walls
      ctx.fillStyle = '#000000'; // Black walls (same as skin)
      for (let r = 0; r < tilemap.rows; r += 1) {
        for (let c = 0; c < tilemap.cols; c += 1) {
          const cell = tilemap.cells[r * tilemap.cols + c];
          if (cell.solid) {
            ctx.fillRect(c * tilemap.tileSize, r * tilemap.tileSize, tilemap.tileSize, tilemap.tileSize);
          }
        }
      }
      
      // Draw map skin on top of the tiles
      if (mapImg.complete) {
        ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
      }
      
      
      // dots
      ctx.fillStyle = '#FFFFFF';
      for (let r = 0; r < tilemap.rows; r += 1) {
        for (let c = 0; c < tilemap.cols; c += 1) {
          const cell = tilemap.cells[r * tilemap.cols + c];
          if (cell.dot) {
            ctx.beginPath(); 
            ctx.arc(c * tilemap.tileSize + tilemap.tileSize / 2, r * tilemap.tileSize + tilemap.tileSize / 2, 2, 0, Math.PI * 2); 
            ctx.fill();
          }
          if (cell.powerPellet) {
            // Power pellet with flashing animation
            const flash = Math.sin(animationTime * 0.01) > 0 ? 1 : 0.3;
            ctx.globalAlpha = flash;
            ctx.beginPath(); 
            ctx.arc(c * tilemap.tileSize + tilemap.tileSize / 2, r * tilemap.tileSize + tilemap.tileSize / 2, 6, 0, Math.PI * 2); 
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }
      
      // Draw Pac-Man image skin if available, fallback to vector mouth
      const drawPacman = (x: number, y: number, size: number, direction: string) => {
        const img = (window as any).__pacmanImg as HTMLImageElement | undefined;
        if (img && img.complete) {
          const w = size*2, h = size*2; // 2x scale as requested
          ctx.save();
          ctx.translate(x, y);
          const angle = direction === 'right' ? 0 : direction === 'left' ? Math.PI : direction === 'up' ? -Math.PI / 2 : Math.PI / 2;
          ctx.rotate(angle);
          // Center the image at the channel center line
          ctx.drawImage(img, -w/2, -h/2, w, h);
          ctx.restore();
          return;
        }
        const radius = size / 2;
        const mouthAngle = Math.PI / 3; // 60 degrees for classic V-shaped mouth
        const mouthAnimation = Math.sin(animationTime * 0.015) * 0.3 + 0.7; // Faster, smoother animation
        const currentMouthAngle = mouthAngle * mouthAnimation;
        
        let startAngle = 0;
        let endAngle = Math.PI * 2;
        
        // Calculate mouth angles based on direction
        switch (direction) {
          case 'right':
            startAngle = -currentMouthAngle / 2;
            endAngle = currentMouthAngle / 2;
            break;
          case 'left':
            startAngle = Math.PI - currentMouthAngle / 2;
            endAngle = Math.PI + currentMouthAngle / 2;
            break;
          case 'up':
            startAngle = -Math.PI / 2 - currentMouthAngle / 2;
            endAngle = -Math.PI / 2 + currentMouthAngle / 2;
            break;
          case 'down':
            startAngle = Math.PI / 2 - currentMouthAngle / 2;
            endAngle = Math.PI / 2 + currentMouthAngle / 2;
            break;
        }
        
        // Draw classic yellow Pac-Man with transparent pizza-slice mouth
        ctx.fillStyle = '#FFFF00'; // Classic bright yellow
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        
        // Add subtle outline for better definition
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 1;
        ctx.stroke();
      };
      
      // Draw invisible Pac-Man for game logic (collision detection, etc.)
      ctx.save();
      ctx.globalAlpha = 0; // Make invisible
      drawPacman(pacman.position.x, pacman.position.y, pacman.size, pacman.direction);
      ctx.restore();
      
      // Draw ghosts with proper colors and shapes
      const drawGhost = (x: number, y: number, size: number, color: string, mode: string, isFlashing: boolean = false, ghostId: string) => {
        // Draw eyes image if in eyes mode
        if (mode === 'eyes') {
          const eyesImg = (window as any).__eyesImg as HTMLImageElement | undefined;
          if (eyesImg && eyesImg.complete) {
            const w = size, h = size;
            ctx.save();
            ctx.translate(x, y);
            // Center the eyes image
            ctx.drawImage(eyesImg, -w/2, -h/2, w, h);
            ctx.restore();
            return;
          } else {
            // Fallback: draw simple eyes when image not loaded
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x - size * 0.15, y - size * 0.2, size * 0.08, 0, Math.PI * 2);
            ctx.arc(x + size * 0.15, y - size * 0.2, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x - size * 0.15, y - size * 0.2, size * 0.04, 0, Math.PI * 2);
            ctx.arc(x + size * 0.15, y - size * 0.2, size * 0.04, 0, Math.PI * 2);
            ctx.fill();
            return;
          }
        }
        
        // Load individual ghost images
        const ghostImg = new Image();
        if (mode === 'frightened') {
          // Use 5.jpg for frightened mode
          ghostImg.src = '/5.jpg';
        } else {
          // Use individual ghost images for normal mode
          switch (ghostId) {
            case 'blinky': ghostImg.src = '/4.jpg'; break;
            case 'pinky': ghostImg.src = '/1.jpg'; break;
            case 'inky': ghostImg.src = '/2.jpg'; break;
            case 'clyde': ghostImg.src = '/3.jpg'; break;
          }
        }
        
        // Use individual ghost image if loaded
        if (ghostImg.complete) {
          // Adjust size based on mode: frightened mode is 0.6x smaller
          const sizeMultiplier = mode === 'frightened' ? 1.8 * 0.8 : 1.8;
          const w = size * sizeMultiplier, h = size * sizeMultiplier;
          ctx.save();
          ctx.translate(x, y);
          
          // Apply flashing effect for frightened mode
          if (mode === 'frightened' && isFlashing) {
            const flashSpeed = 200;
            const flashPhase = (animationTime % (flashSpeed * 2)) / flashSpeed;
            ctx.globalAlpha = flashPhase < 1 ? 1 : 0.3; // Flash between full opacity and semi-transparent
          }
          
          // Draw the ghost sprite (full image, with size adjustment)
          ctx.drawImage(
            ghostImg,
            0, 0, ghostImg.width, ghostImg.height, // Source rectangle (full image)
            -w/2, -h/2, w, h // Destination rectangle (adjusted size)
          );
          
          ctx.restore();
          return;
        }
        
        // Fallback to original vector drawing if image not loaded
        // Adjust size based on mode: frightened mode is 0.6x smaller
        const sizeMultiplier = mode === 'frightened' ? 0.6 : 1;
        const adjustedSize = size * sizeMultiplier;
        const radius = adjustedSize / 2;
        
        // Ghost body color changes when frightened
        if (mode === 'frightened') {
          if (isFlashing) {
            // Blue-white flashing animation
            const flashSpeed = 200; // milliseconds per flash
            const flashPhase = (animationTime % (flashSpeed * 2)) / flashSpeed;
            ctx.fillStyle = flashPhase < 1 ? '#0000ff' : '#ffffff'; // Blue to white
          } else {
            ctx.fillStyle = '#0000ff'; // Solid blue
          }
        } else {
          ctx.fillStyle = color;
        }
        
        ctx.beginPath();
        // Ghost body (rounded top with wavy bottom)
        ctx.arc(x, y - radius * 0.5, radius, Math.PI, 0, false); // Top half circle
        
        // Wavy bottom
        const waveCount = 6;
        const waveHeight = radius * 0.4;
        for (let i = 0; i <= waveCount; i++) {
          const waveX = x + radius - (i * (radius * 2) / waveCount);
          const waveY = y + (i % 2 === 0 ? waveHeight : -waveHeight * 0.5);
          ctx.lineTo(waveX, waveY);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Ghost eyes (white ovals)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.25, y - radius * 0.4, radius * 0.12, radius * 0.08, 0, 0, Math.PI * 2);
        ctx.ellipse(x + radius * 0.25, y - radius * 0.4, radius * 0.12, radius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils (blue circles)
        ctx.fillStyle = '#0000ff';
        ctx.beginPath();
        ctx.arc(x - radius * 0.25, y - radius * 0.4, radius * 0.06, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.25, y - radius * 0.4, radius * 0.06, 0, Math.PI * 2);
        ctx.fill();
      };
      
      const ghostColors: Record<string, string> = { 
        blinky: '#FF0000', // Red - Blinky
        pinky: '#FFB8FF',  // Pink - Pinky  
        inky: '#00FFFF',   // Cyan - Inky
        clyde: '#FFB852'   // Orange - Clyde
      };
      
      ghosts.forEach(g => {
        drawGhost(g.position.x, g.position.y, g.size, ghostColors[g.id] || '#fff', g.mode, g.isFlashing, g.id);
      });
      
      requestAnimationFrame(draw);
    };
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [tilemap, pacman, ghosts]);

  const gameWidthPx = tilemap.cols * tilemap.tileSize;
  const gameHeightPx = tilemap.rows * tilemap.tileSize;

  return (
    <>
      {/* Start Screen */}
      {showStartScreen && (
        <StartScreen onStartGame={handleStartGame} />
      )}
      
      {/* Game Animations */}
      {showGameAnimation && showGameAnimation !== 'end' && (
        <GameAnimations 
          type={showGameAnimation} 
          onComplete={handleAnimationComplete}
        />
      )}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        background: overlayActive ? 'transparent' : '#000000',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        width: '100%'
      }}>
        {/* Left spacer to balance the layout */}
        <div style={{ 
          width: '240px',
          height: '1px'
        }}></div>
        
        <div ref={gameOuterRef} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          width: gameWidthPx,
          height: gameHeightPx,
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
      }}>
        <canvas 
          ref={canvasRef} 
          width={tilemap.cols * tilemap.tileSize} 
          height={tilemap.rows * tilemap.tileSize} 
          aria-label="Pac-Man game canvas"
          style={{
            border: '2px solid #0080FF',
            borderRadius: '8px'
          }}
        />
        {overlayActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 1000
          }} />
        )}
        
        {/* Standalone Animated Pac-Man Component */}
        {state.running && !state.paused && (
          <PacManAnimated
            x={pacman.position.x}
            y={pacman.position.y}
            size={pacman.size}
            direction={pacman.direction as 'up' | 'down' | 'left' | 'right'}
            isAnimating={state.running}
          />
        )}
        </div>
        
        {/* Game Info Panel */}
        <div ref={infoPanelRef} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '20px',
          background: 'rgba(0, 128, 255, 0.1)',
          border: '2px solid #0080FF',
          borderRadius: '8px',
          minWidth: '200px',
          fontFamily: 'Courier New, monospace',
          color: '#FFFFFF'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            color: '#FFFF00',
            textAlign: 'center',
            borderBottom: '1px solid #0080FF',
            paddingBottom: '10px'
          }}>
            GAME INFO
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '5px' }}>CURRENT SCORE</div>
              <div style={{ fontSize: '20px', color: '#FFFF00', fontWeight: 'bold' }}>
                {state.score.score.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '5px' }}>HIGH SCORE</div>
              <div style={{ fontSize: '20px', color: '#FF6B6B', fontWeight: 'bold' }}>
                {state.score.highScore.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '5px' }}>LIVES</div>
              <div style={{ fontSize: '20px', color: '#4ECDC4', fontWeight: 'bold' }}>
                {'❤️ '.repeat(pacman.lives)}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '5px' }}>LEVEL</div>
              <div style={{ fontSize: '20px', color: '#95E1D3', fontWeight: 'bold' }}>
                {level.levelNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay screens */}
        {showStart && (
          <div role="dialog" aria-modal="true" style={{ 
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(0,0,0,0.8)', 
            color: '#FFFF00', 
            fontFamily: 'Courier New, monospace',
            fontSize: '18px',
            zIndex: 9999
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '24px', 
              border: '2px solid #FFFFFF', 
              background: 'rgba(0,0,0,0.9)',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginTop: 0, fontSize: '24px', fontWeight: 'bold' }}>PAC-MAN</h3>
              <p style={{ margin: '16px 0', fontSize: '16px' }}>Press any key to start</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#CCCCCC' }}>遊戲開始前所有物件靜止。按任意鍵或滑鼠開始。</p>
            </div>
          </div>
        )}
        {gameOver && (
          <EndOverlay 
            score={state.score.score}
            highScore={state.score.highScore}
            onRestart={resetGame}
          />
        )}
        {gameWon && (
          <div role="dialog" aria-modal="true" style={{ 
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(0,0,0,0.8)', 
            color: '#00FF00', 
            fontFamily: 'Courier New, monospace',
            fontSize: '18px',
            zIndex: 9999
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '24px', 
              border: '2px solid #00FF00', 
              background: 'rgba(0,0,0,0.9)',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginTop: 0, fontSize: '24px', fontWeight: 'bold' }}>YOU WIN!</h3>
              <p style={{ margin: '16px 0', fontSize: '16px' }}>Congratulations!</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#CCCCCC' }}>Press any key to play again</p>
            </div>
          </div>
        )}
        {state.paused && (
          <div role="dialog" aria-modal="true" style={{ 
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(0,0,0,0.7)', 
            color: '#FFFF00', 
            fontFamily: 'Courier New, monospace',
            fontSize: '18px',
            zIndex: 9999
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '24px', 
              border: '2px solid #FFFF00', 
              background: 'rgba(0,0,0,0.9)',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginTop: 0, fontSize: '24px', fontWeight: 'bold' }}>PAUSED</h3>
              <div style={{ margin: '16px 0', fontSize: '16px', lineHeight: '1.6' }}>
                <p style={{ margin: '8px 0' }}>SPACE - Resume Game</p>
                <p style={{ margin: '8px 0' }}>R - Restart Game</p>
              </div>
              <div style={{ margin: 0, fontSize: '14px', color: '#CCCCCC', lineHeight: '1.4' }}>
                <p style={{ margin: '4px 0' }}>空白鍵 - 繼續遊戲</p>
                <p style={{ margin: '4px 0' }}>R 鍵 - 重新開始</p>
              </div>
            </div>
          </div>
        )}
        {showLevelTransition && (
          <div role="dialog" aria-modal="true" style={{ 
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(0,0,0,0.8)', 
            color: '#00FF00', 
            fontFamily: 'Courier New, monospace',
            fontSize: '18px',
            zIndex: 9999
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '24px', 
              border: '2px solid #00FF00', 
              background: 'rgba(0,0,0,0.9)',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginTop: 0, fontSize: '24px', fontWeight: 'bold' }}>LEVEL COMPLETE!</h3>
              <p style={{ margin: '16px 0', fontSize: '16px' }}>Advancing to Level {level.levelNumber + 1}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#CCCCCC' }}>關卡完成！進入第 {level.levelNumber + 1} 關</p>
            </div>
      </div>
        )}
    </div>
    </>
  );
}

export default GameCanvas;


