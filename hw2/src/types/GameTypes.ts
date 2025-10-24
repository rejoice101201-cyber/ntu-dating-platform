export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Vector2 {
  x: number;
  y: number;
}

export interface TilePosition {
  col: number;
  row: number;
}

export interface Entity {
  id: string;
  position: Vector2; // pixel position
  velocity: Vector2; // pixels per second
  size: number; // pixels (render size)
  direction: Direction;
  speed: number; // base tiles/sec scaled to pixels
}

export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type GhostMode = 'scatter' | 'chase' | 'frightened' | 'eyes';

export interface Ghost extends Entity {
  name: GhostName;
  mode: GhostMode;
  modeTimerMs: number;
  frightenedTimerMs: number;
  homeCorner: TilePosition;
  previousMode?: GhostMode; // Remember mode before being eaten
  isCruiseElroy?: boolean; // Blinky's Cruise Elroy state
  isFlashing?: boolean; // Blue-white flashing animation state
}

export interface Pacman extends Entity {
  lives: number;
  pendingDirection: Direction;
}

export interface LevelConfig {
  levelNumber: number;
  pacmanSpeedTilesPerSecond: number;
  pacmanPowerSpeedTilesPerSecond: number; // Speed when eating power pellets
  ghostSpeedTilesPerSecond: number;
  ghostFrightenedSpeedTilesPerSecond: number; // Speed when frightened
  frightenedDurationMs: number;
  eyesDurationMs: number; // Eyes mode duration
  scatterDurationMs: number; // Scatter mode duration
  chaseDurationMs: number; // Chase mode duration
  fruitType: string; // Type of fruit for this level
  fruitScore: number; // Score for eating fruit
}

export interface ScoreState {
  score: number;
  highScore: number;
  level: number;
  extraLifeAwarded: boolean;
}

export interface GameState {
  running: boolean;
  paused: boolean;
  debug: boolean;
  dotsRemaining: number;
  powerPelletsRemaining: number;
  score: ScoreState;
}

export interface TilemapCell {
  solid: boolean;
  dot: boolean;
  powerPellet: boolean;
}

export interface Tilemap {
  cols: number;
  rows: number;
  tileSize: number; // pixels
  cells: TilemapCell[]; // length = cols*rows
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  pause: boolean; // Q key for pause
  space: boolean; // Space key for resume
  restart: boolean; // R key for restart
}

export interface AudioSettings {
  muted: boolean;
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
}


