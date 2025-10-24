import type { Tilemap, TilemapCell } from '../types/GameTypes';

export function createArrayFilled<T>(length: number, valueFactory: (index: number) => T): T[] {
  const arr: T[] = new Array(length);
  for (let i = 0; i < length; i += 1) arr[i] = valueFactory(i);
  return arr;
}

export function createDefaultTilemap(tileSize = 16): Tilemap {
  // Fixed maze layout based on user's drawing - 28x31 classic Pac-Man size
  const cols = 28;
  const rows = 31;
  const cells: TilemapCell[] = createArrayFilled(cols * rows, () => ({ solid: true, dot: false, powerPellet: false }));

  const index = (c: number, r: number) => r * cols + c;
  const setCell = (c: number, r: number, solid: boolean, dot: boolean = false, powerPellet: boolean = false) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return;
    const cell = cells[index(c, r)];
    cell.solid = solid;
    cell.dot = dot;
    cell.powerPellet = powerPellet;
  };

  // Classic Pac-Man maze layout - 31 rows exactly
  const mazeLayout = [
    "############################", // 0
    "#............##............#", // 1
    "#.####.#####.##.#####.####.#", // 2
    "#o####.#####.##.#####.####o#", // 3
    "#.####.#####.##.#####.####.#", // 4
    "#..........................#", // 5
    "#.####.##.########.##.####.#", // 6
    "#.####.##.########.##.####.#", // 7
    "#......##....##....##......#", // 8
    "######.#####.##.#####.######", // 9
    "######.#####.##.#####.######", // 10
    "######.##..........##.######", // 11
    "######.##.###  ###.##.######", // 12
    "######.##.#      #.##.######", // 13
    "######....#  G   #....######", // 14
    "######.##.#      #.##.######", // 15
    "######.##.########.##.######", // 16
    "######.##..........##.######", // 17
    "######.##.########.##.######", // 18
    "######.##.########.##.######", // 19
    "#............##............#", // 20
    "#.####.#####.##.#####.####.#", // 21
    "#.####.#####.##.#####.####.#", // 22
    "#o..##................##..o#", // 23
    "###.##.##.########.##.##.###", // 24
    "###.##.##.########.##.##.###", // 25
    "#......##....##....##......#", // 26
    "#.##########.##.##########.#", // 27
    "#.##########.##.##########.#", // 28
    "#..........................#", // 29
    "############################", // 30
  ];

  // Apply the fixed maze layout
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const char = mazeLayout[r] ? mazeLayout[r][c] : '#';
      if (char === '#') {
        setCell(c, r, true, false, false); // Wall
      } else if (char === 'o') {
        setCell(c, r, false, false, true); // Power pellet
      } else if (char === '.') {
        setCell(c, r, false, true, false); // Dot
      } else if (char === ' ') {
        setCell(c, r, false, false, false); // Space = path without dot
      } else if (char === 'G') {
        setCell(c, r, false, false, false); // Ghost respawn point = walkable path without dot
      } else {
        setCell(c, r, true, false, false); // Default to wall
      }
    }
  }

  // Tunnel logic completely removed to preserve original map design

  return { cols, rows, tileSize, cells };
}

export function isSolid(tilemap: Tilemap, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= tilemap.cols || row >= tilemap.rows) return true;
  return tilemap.cells[row * tilemap.cols + col].solid;
}

export function eatDot(tilemap: Tilemap, col: number, row: number): 'dot' | 'power' | null {
  if (col < 0 || row < 0 || col >= tilemap.cols || row >= tilemap.rows) return null;
  const cell = tilemap.cells[row * tilemap.cols + col];
  if (cell.powerPellet) {
    cell.powerPellet = false;
    return 'power';
  }
  if (cell.dot) {
    cell.dot = false;
    return 'dot';
  }
  return null;
}