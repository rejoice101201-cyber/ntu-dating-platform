import type { Direction, Entity, GameState, Ghost, GhostName, InputState, LevelConfig, Pacman, Tilemap } from '../types/GameTypes';
import { isSolid, eatDot } from './tilemap';
import { HighScoreManager } from '../utils/HighScoreManager';

export const TILE_SIZE = 27.9; // 31 * 0.9 = 27.9 (90% of original size)

export function createLevelConfig(levelNumber: number): LevelConfig {
  if (levelNumber === 1) {
    return {
      levelNumber: 1,
      pacmanSpeedTilesPerSecond: 2.4, // 80% of max (3.0)
      pacmanPowerSpeedTilesPerSecond: 2.7, // 90% when eating power pellets
      ghostSpeedTilesPerSecond: 2.25, // 75% of max (3.0)
      ghostFrightenedSpeedTilesPerSecond: 1.5, // 50% when frightened
      frightenedDurationMs: 8000, // 8 seconds
      eyesDurationMs: 5000, // 5 seconds (眼睛模式時間)
      scatterDurationMs: 7000, // 7 seconds
      chaseDurationMs: 20000, // 20 seconds
      fruitType: 'Cherry',
      fruitScore: 100,
    };
  } else if (levelNumber === 2) {
    return {
      levelNumber: 2,
      pacmanSpeedTilesPerSecond: 2.7, // 90% of max (3.0)
      pacmanPowerSpeedTilesPerSecond: 2.85, // 95% when eating power pellets
      ghostSpeedTilesPerSecond: 2.55, // 85% of max (3.0)
      ghostFrightenedSpeedTilesPerSecond: 1.65, // 55% when frightened
      frightenedDurationMs: 8000, // 8 seconds
      eyesDurationMs: 5000, // 5 seconds (眼睛模式時間)
      scatterDurationMs: 5000, // 5 seconds
      chaseDurationMs: 20000, // 20 seconds
      fruitType: 'Strawberry',
      fruitScore: 300,
    };
  } else {
    // Level 3+ with progressive difficulty
    const frightenedBase = 6000;
    const frightened = Math.max(3000, frightenedBase - (levelNumber - 3) * 500);
    return {
      levelNumber,
      pacmanSpeedTilesPerSecond: 3.0, // Max speed
      pacmanPowerSpeedTilesPerSecond: 3.0, // Max speed
      ghostSpeedTilesPerSecond: 3.0, // Max speed
      ghostFrightenedSpeedTilesPerSecond: 1.5, // 50% when frightened
      frightenedDurationMs: frightened,
      eyesDurationMs: 5000, // 5 seconds (眼睛模式時間)
      scatterDurationMs: 5000, // 5 seconds
      chaseDurationMs: 20000, // 20 seconds
      fruitType: 'Orange',
      fruitScore: 500,
    };
  }
}

export function createPacman(startCol: number, startRow: number, tileSize: number, level?: LevelConfig): Pacman {
  const x = startCol * tileSize + tileSize / 2;
  const y = startRow * tileSize + tileSize / 2;
  const initialSpeed = level ? level.pacmanSpeedTilesPerSecond * tileSize : tileSize * 2.4; // Default speed if no level
  return {
    id: 'pacman',
    position: { x, y },
    velocity: { x: 0, y: 0 },
    size: tileSize * 0.5, // Match the size used in GameCanvas
    direction: 'up', // Initial direction upward
    speed: initialSpeed,
    pendingDirection: 'up',
    lives: 3,
  };
}

function ghostHomeCorner(name: GhostName, cols: number, rows: number) {
  switch (name) {
    case 'blinky': return { col: cols - 2, row: 1 };
    case 'pinky': return { col: 1, row: 1 };
    case 'inky': return { col: cols - 2, row: rows - 2 };
    case 'clyde': return { col: 1, row: rows - 2 };
  }
}

export function createGhost(name: GhostName, col: number, row: number, tileSize: number, level: LevelConfig, cols: number, rows: number): Ghost {
  return {
    id: name,
    name,
    position: { x: col * tileSize + tileSize / 2, y: row * tileSize + tileSize / 2 },
    velocity: { x: 0, y: 0 },
    size: tileSize * 0.8, // Match Pac-Man size
    direction: 'up', // All ghosts start facing up (toward exit)
    speed: level.ghostSpeedTilesPerSecond * tileSize,
    mode: 'scatter',
    modeTimerMs: 7000,
    frightenedTimerMs: 0,
    homeCorner: ghostHomeCorner(name, cols, rows),
    previousMode: undefined, // No previous mode initially
    isCruiseElroy: false, // Blinky starts in normal state
    isFlashing: false, // No flashing initially
  };
}

export function tileAt(entity: Entity, tileSize: number) {
  return { col: Math.floor(entity.position.x / tileSize), row: Math.floor(entity.position.y / tileSize) };
}

export function isAtTileCenter(entity: Entity, tileSize: number): boolean {
  const centerX = Math.floor(entity.position.x / tileSize) * tileSize + tileSize / 2;
  const centerY = Math.floor(entity.position.y / tileSize) * tileSize + tileSize / 2;
  const tolerance = 0.1; // Small tolerance for floating point precision
  return Math.abs(entity.position.x - centerX) < tolerance && Math.abs(entity.position.y - centerY) < tolerance;
}

export function directionToVector(direction: Direction): { x: number; y: number } {
  switch (direction) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
    default: return { x: 0, y: 0 };
  }
}

export function canTurn(entity: Entity, nextDir: Direction, tilemap: Tilemap): boolean {
  const vector = directionToVector(nextDir);
  const targetX = entity.position.x + vector.x * tilemap.tileSize;
  const targetY = entity.position.y + vector.y * tilemap.tileSize;
  return !checkWallCollision(targetX, targetY, entity.size, tilemap);
}

export function updatePacmanDirection(pacman: Pacman, input: InputState, tilemap: Tilemap) {
  // Check for input in priority order: up, down, left, right
  let desired: Direction = pacman.direction;
  if (input.up) desired = 'up';
  else if (input.down) desired = 'down';
  else if (input.left) desired = 'left';
  else if (input.right) desired = 'right';
  
  pacman.pendingDirection = desired;
  
  // Allow immediate direction change if possible (for continuous movement)
  const can = canTurn(pacman, desired, tilemap);
  if (can) {
    pacman.direction = desired;
  }
  
  // If at tile center, can also turn to any valid direction
  if (isAtTileCenter(pacman, tilemap.tileSize)) {
    const canTurnAtCenter = canTurn(pacman, desired, tilemap);
    if (canTurnAtCenter) {
      // Force snap to tile center for precise turning
      const currentTile = tileAt(pacman, tilemap.tileSize);
      pacman.position.x = currentTile.col * tilemap.tileSize + tilemap.tileSize / 2;
      pacman.position.y = currentTile.row * tilemap.tileSize + tilemap.tileSize / 2;
      pacman.direction = desired;
    }
  }
}

export function moveEntity(entity: Entity, deltaMs: number, tilemap: Tilemap) {
  const vector = directionToVector(entity.direction);
  
  // Calculate movement speed in pixels per frame
  const speed = entity.speed * (deltaMs / 1000);
  
  // Try to move in current direction
  const newX = entity.position.x + vector.x * speed;
  const newY = entity.position.y + vector.y * speed;
  
  // Check if movement is valid (no wall collision)
  if (!checkWallCollision(newX, newY, entity.size, tilemap)) {
    entity.position.x = newX;
    entity.position.y = newY;
  }
}

function checkWallCollision(x: number, y: number, size: number, tilemap: Tilemap): boolean {
  const radius = size / 2;
  
  // Check multiple points around the entity for collision
  const checkPoints = [
    { x: x - radius, y: y - radius }, // top-left
    { x: x + radius, y: y - radius }, // top-right
    { x: x - radius, y: y + radius }, // bottom-left
    { x: x + radius, y: y + radius }, // bottom-right
    { x: x, y: y }, // center
  ];
  
  for (const point of checkPoints) {
    const col = Math.floor(point.x / tilemap.tileSize);
    const row = Math.floor(point.y / tilemap.tileSize);
    
    if (isSolid(tilemap, col, row)) {
      return true;
    }
  }
  
  return false;
}

// Helper function to check if position is valid (not a wall)
function canMove(x: number, y: number, tilemap: Tilemap): boolean {
  const col = Math.floor(x / tilemap.tileSize);
  const row = Math.floor(y / tilemap.tileSize);
  return !isSolid(tilemap, col, row);
}


export function aabbIntersect(a: Entity, b: Entity): boolean {
  const half = (size: number) => size / 2;
  return Math.abs(a.position.x - b.position.x) < half(a.size) + half(b.size)
      && Math.abs(a.position.y - b.position.y) < half(a.size) + half(b.size);
}


export function updateGhostModes(ghosts: Ghost[], deltaMs: number, level: LevelConfig) {
  ghosts.forEach(g => {
    if (g.mode === 'frightened') {
      g.frightenedTimerMs -= deltaMs;
      
      // Start flashing animation 2 seconds before frightened mode ends
      if (g.frightenedTimerMs <= 1000) {
        g.isFlashing = true;
      } else {
        g.isFlashing = false;
      }
      
      if (g.frightenedTimerMs <= 0) {
        g.mode = 'chase';
        g.frightenedTimerMs = 0;
        g.isFlashing = false;
      }
      return;
    }
    
    if (g.mode === 'eyes') {
      g.frightenedTimerMs -= deltaMs;
      
      if (g.frightenedTimerMs <= 0) {
        // Return to previous mode or scatter
        if (g.previousMode === 'frightened' && g.frightenedTimerMs > 0) {
          g.mode = 'frightened';
        } else {
          g.mode = 'scatter';
          g.modeTimerMs = level.scatterDurationMs;
        }
        g.previousMode = undefined;
        g.frightenedTimerMs = 0;
      }
      return;
    }
    
    // Reset flashing state when not in frightened mode
    g.isFlashing = false;
    
    g.modeTimerMs -= deltaMs;
    if (g.modeTimerMs <= 0) {
      g.mode = g.mode === 'scatter' ? 'chase' : 'scatter';
      g.modeTimerMs = g.mode === 'scatter' ? level.scatterDurationMs : level.chaseDurationMs;
    }
  });
}

// Helper function to get direction with BFS fallback
function getDirectionWithBfs(tilemap: Tilemap, from: { col: number; row: number }, to: { col: number; row: number }): Direction {
  return getNextDirectionBfs(tilemap, from, to) ?? getDirectionToTarget(from, to);
}

// Add throttling for ghost AI updates
let lastGhostUpdate = 0;
const GHOST_UPDATE_INTERVAL = 100; // Update ghost AI every 100ms instead of every frame


export function updateGhostDirections(ghosts: Ghost[], pacman: Pacman, tilemap: Tilemap, currentTime: number = 0) {
  // Throttle ghost AI updates to reduce computation
  if (currentTime - lastGhostUpdate < GHOST_UPDATE_INTERVAL) {
    return;
  }
  lastGhostUpdate = currentTime;
  
  ghosts.forEach(g => {
    let dir: Direction = g.direction;
    const ghostTile = tileAt(g, tilemap.tileSize);
    
    if (g.mode === 'eyes') {
      // Ghost is returning to ghost house - use BFS to find optimal path
      const ghostHouseCenter = { col: 14, row: 14 };
      
      // Use BFS for optimal pathfinding to ghost house
      const bfsDirection = getNextDirectionBfs(tilemap, ghostTile, ghostHouseCenter);
      if (bfsDirection) {
        dir = bfsDirection;
      } else {
        // Fallback to simple direction if BFS fails
        dir = getDirectionToTarget(ghostTile, ghostHouseCenter);
      }
      
      // Check if ghost has reached the ghost house (within 1 tile of center)
      const distanceToCenter = Math.abs(ghostTile.col - 14) + Math.abs(ghostTile.row - 14);
      if (distanceToCenter <= 1) {
        // Ghost has reached the ghost house, restore to previous mode
        if (g.previousMode === 'frightened' && g.frightenedTimerMs > 0) {
          // If was frightened and still has time, continue being frightened
          g.mode = 'frightened';
        } else {
          // Otherwise, go back to scatter mode
          g.mode = 'scatter';
          g.modeTimerMs = 7000;
        }
        g.previousMode = undefined; // Clear previous mode
      }
    } else if (g.mode === 'frightened') {
      // Check if ghost is in ghost house
      const inGhostHouse = ghostTile.row >= 12 && ghostTile.row <= 15 && 
                          ghostTile.col >= 12 && ghostTile.col <= 15;
      
      if (inGhostHouse) {
        // In ghost house - try to exit upward to be vulnerable
        if (ghostTile.row > 14) {
          dir = 'up'; // Move up to center
        } else if (ghostTile.row === 14) {
          // At center, try to exit through the top
          if (ghostTile.col === 14) {
            dir = 'up'; // Exit upward from center
          } else {
            dir = ghostTile.col < 14 ? 'right' : 'left'; // Move to center first
          }
        } else {
          dir = 'down'; // Move down to center
        }
      } else {
        // Outside ghost house - move away from Pac-Man when frightened
        const dx = g.position.x - pacman.position.x;
        const dy = g.position.y - pacman.position.y;
        // Choose direction that maximizes distance from Pac-Man
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx > 0 ? 'right' : 'left';
        } else {
          dir = dy > 0 ? 'down' : 'up';
        }
      }
    } else if (g.mode === 'scatter') {
      // Check if ghost is in ghost house (rows 12-15, cols 12-15)
      const inGhostHouse = ghostTile.row >= 12 && ghostTile.row <= 15 && 
                          ghostTile.col >= 12 && ghostTile.col <= 15;
      
      if (inGhostHouse) {
        // Ghost is in house - try to exit upward
        if (ghostTile.row > 14) {
          dir = 'up'; // Move up to center
        } else if (ghostTile.row === 14) {
          // At center, try to exit through the top
          if (ghostTile.col === 14) {
            dir = 'up'; // Exit upward from center
          } else {
            dir = ghostTile.col < 14 ? 'right' : 'left'; // Move to center first
          }
        } else {
          dir = 'down'; // Move down to center
        }
      } else {
        // Move to home corner when outside ghost house
        const dx = g.homeCorner.col * tilemap.tileSize + tilemap.tileSize / 2 - g.position.x;
        const dy = g.homeCorner.row * tilemap.tileSize + tilemap.tileSize / 2 - g.position.y;
        dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
    } else if (g.mode === 'chase') {
      // Different AI for each ghost
      const pacmanTile = tileAt(pacman, tilemap.tileSize);
      
      switch (g.name) {
        case 'blinky': // Red - most aggressive, direct chase
          // Blinky targets Pac-Man's current position directly
          dir = getDirectionWithBfs(tilemap, ghostTile, pacmanTile);
          break;
        case 'pinky': // Pink - targets 4 tiles ahead of Pac-Man
          let pinkyTarget = getTileAhead(pacmanTile, pacman.direction, 4);
          
          // Original game bug: when Pac-Man moves up, Pinky targets 4 tiles ahead and 4 tiles left
          if (pacman.direction === 'up') {
            pinkyTarget = { 
              col: pinkyTarget.col - 4, 
              row: pinkyTarget.row 
            };
          }
          
          dir = getDirectionWithBfs(tilemap, ghostTile, pinkyTarget);
          break;
        case 'inky': // Cyan - complex targeting based on Pac-Man and Blinky positions
          const blinky = ghosts.find(gh => gh.name === 'blinky');
          if (blinky) {
            const blinkyTile = tileAt(blinky, tilemap.tileSize);
            // Calculate Pac-Man's position 2 tiles ahead
            const pacmanAhead2 = getTileAhead(pacmanTile, pacman.direction, 2);
            // Create vector from Blinky to Pac-Man's 2-tile-ahead position, then double it
            const vector = { 
              col: pacmanAhead2.col + (pacmanAhead2.col - blinkyTile.col), 
              row: pacmanAhead2.row + (pacmanAhead2.row - blinkyTile.row) 
            };
            dir = getDirectionWithBfs(tilemap, ghostTile, vector);
          } else {
            // Fallback to direct chase if Blinky not found
            dir = getDirectionWithBfs(tilemap, ghostTile, pacmanTile);
          }
          break;
        case 'clyde': // Orange - sometimes moves away from Pac-Man
          const distance = Math.abs(ghostTile.col - pacmanTile.col) + Math.abs(ghostTile.row - pacmanTile.row);
          if (distance > 8) {
            dir = getDirectionWithBfs(tilemap, ghostTile, pacmanTile);
          } else {
            dir = getDirectionToTarget(ghostTile, g.homeCorner);
          }
          break;
      }
    }
    
    // Ensure ghost never stops: if planned dir blocked, pick a random viable direction
    if (!canTurn(g, dir, tilemap)) {
      const candidates: Direction[] = ['up','down','left','right'];
      // remove opposite direction to reduce oscillation
      const opposite: Record<Direction, Direction> = { up:'down', down:'up', left:'right', right:'left' } as any;
      const filtered = candidates.filter(d => d !== opposite[g.direction] && canTurn(g, d, tilemap));
      if (filtered.length) {
        dir = filtered[Math.floor(Math.random() * filtered.length)];
      }
    }
    if (canTurn(g, dir, tilemap)) g.direction = dir;
  });
}

function getDirectionToTarget(from: { col: number; row: number }, to: { col: number; row: number }): Direction {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

// BFS to compute next step direction on grid avoiding walls
function getNextDirectionBfs(tilemap: Tilemap, from: { col: number; row: number }, to: { col: number; row: number }): Direction | null {
  const cols = tilemap.cols, rows = tilemap.rows;
  const key = (c: number, r: number) => `${c},${r}`;
  const inBounds = (c: number, r: number) => c >= 0 && r >= 0 && c < cols && r < rows;
  const visited = new Set<string>();
  const queue: Array<{ c: number; r: number; firstDir: Direction | null }> = [];
  visited.add(key(from.col, from.row));
  // Seed neighbors with their direction from start
  const neighbors: Array<{ dc: number; dr: number; dir: Direction }> = [
    { dc: 0, dr: -1, dir: 'up' },
    { dc: 0, dr: 1, dir: 'down' },
    { dc: -1, dr: 0, dir: 'left' },
    { dc: 1, dr: 0, dir: 'right' },
  ];
  for (const n of neighbors) {
    const nc = from.col + n.dc; const nr = from.row + n.dr;
    if (inBounds(nc, nr) && !isSolid(tilemap, nc, nr)) {
      visited.add(key(nc, nr));
      queue.push({ c: nc, r: nr, firstDir: n.dir });
    }
  }
  while (queue.length) {
    const { c, r, firstDir } = queue.shift()!;
    if (c === to.col && r === to.row) return firstDir;
    for (const n of neighbors) {
      const nc = c + n.dc; const nr = r + n.dr;
      const k = key(nc, nr);
      if (!inBounds(nc, nr) || visited.has(k) || isSolid(tilemap, nc, nr)) continue;
      visited.add(k);
      queue.push({ c: nc, r: nr, firstDir });
    }
  }
  return null;
}

function getTileAhead(tile: { col: number; row: number }, direction: Direction, distance: number): { col: number; row: number } {
  switch (direction) {
    case 'up': return { col: tile.col, row: tile.row - distance };
    case 'down': return { col: tile.col, row: tile.row + distance };
    case 'left': return { col: tile.col - distance, row: tile.row };
    case 'right': return { col: tile.col + distance, row: tile.row };
    default: return tile;
  }
}

export function handleConsumables(pacman: Pacman, tilemap: Tilemap): 'none' | 'dot' | 'power' {
  const col = Math.floor(pacman.position.x / tilemap.tileSize);
  const row = Math.floor(pacman.position.y / tilemap.tileSize);
  const result = eatDot(tilemap, col, row);
  return result || 'none';
}

export function updateLevelSpeeds(pacman: Pacman, ghosts: Ghost[], level: LevelConfig, tileSize: number, isPowerMode: boolean = false) {
  // Set Pac-Man speed based on power mode
  if (isPowerMode) {
    pacman.speed = level.pacmanPowerSpeedTilesPerSecond * tileSize;
  } else {
    pacman.speed = level.pacmanSpeedTilesPerSecond * tileSize;
  }
  
  ghosts.forEach(g => { 
    if (g.mode === 'frightened') {
      // Use specific frightened speed from level config
      g.speed = level.ghostFrightenedSpeedTilesPerSecond * tileSize;
    } else if (g.name === 'blinky' && g.isCruiseElroy) {
      // Blinky moves faster in Cruise Elroy state
      g.speed = level.ghostSpeedTilesPerSecond * tileSize * 1.2; // 20% faster
    } else {
      g.speed = level.ghostSpeedTilesPerSecond * tileSize;
    }
  });
}

export function createInitialGameState(): GameState {
  return {
    running: true,
    paused: false,
    debug: new URLSearchParams(window.location.search).get('debug') === 'true',
    dotsRemaining: 0,
    powerPelletsRemaining: 0,
    score: { score: 0, highScore: HighScoreManager.getHighScore(), level: 1, extraLifeAwarded: false },
  };
}


