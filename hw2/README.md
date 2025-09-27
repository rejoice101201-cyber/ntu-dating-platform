## Classic Pac‑Man Game ##

A simple, fast Pac‑Man clone built with React + TypeScript + Canvas. Pure front‑end. No backend.

### Setup
- Node.js 18+
- Install: `npm install`
- Dev: `npm run dev` → open the shown localhost URL
- Build: `npm run build` then `npm run preview`

### Before you start the game
- Click the "Start Game" buttom to start it.
- Using "up","down","right","left",or "W","S","D","A" to control Pac-Man.
- If you want to pause the game,just push "Q" button and then you can take a break or resume the game.
- You have to know that if there are no white dots,there MUST NOT be entered,so don't say that there is a bug,I've written there clearly,just a decoration.

### Design
- **Visual Style**: Modern Pac-Man game with custom skins and animations
- **Canvas Renderer**: 60 FPS smooth gameplay with optimized rendering
- **Maze Design**: Classic rectangular maze (3:1 ratio) with tunnels, dots, and power pellets
- **Background**: Custom map skin (`map.png`) overlaying the entire canvas
- **Pac-Man**: 
  - Custom animated character with working mouth animation
  - Yellow circle with black eye and animated mouth opening/closing
  - 1.8x size magnification for better visibility
- **Ghosts**: 
  - Individual custom skins: Blinky (4.jpg), Pinky (1.jpg), Inky (2.jpg), Clyde (3.jpg)
  - 1.8x size magnification in normal mode
  - Frightened mode: Uses 5.jpg skin, 0.8x size (smaller), blue tinting with flash effect
  - Eyes mode: Uses eyes.png skin, 0.8x size when returning to ghost house
- **AI Behavior**: 
  - Scatter/Chase/Frightened/Eyes modes with realistic timing
  - Level 1: 10-second frightened duration, Level 2+: 8-second duration
  - Progressive difficulty with speed increases
- **Audio**: 
  - Background music: "01. Game Start.mp3" for main menu
  - Intermission music: "02. Intermission.mp3" for pause screen
  - Sound effects via SoundManager with synth fallback
- **UI Features**:
  - Animated start screen with blooming button effects
  - Game animations for start/pause/end events
  - HUD with score, lives, and level display
  - Rules modal with comprehensive game instructions
- **Scoring System**: 
  - Pac-dots: 10 points, Power pellets: 50 points
  - Blue ghosts: 200 points, Fruits: 100-5000 points
  - Extra life at 10,000 points
- **Data Persistence**: Local high score via `localStorage`

### Controls
- **Movement**: Arrow keys (↑↓←→) or WASD keys
- **Pause**: Q key (press again to resume)
- **Resume**: Space key (when paused)
- **Restart**: R key (when paused)
- **Rules**: Click "Rules" button in the header
- **Start Game**: Click "START GAME" button or press any key on main screen

### Notes
- **Audio Files**: Custom audio files in `public/` directory:
  - `01. Game Start.mp3` - Main menu background music
  - `02. Intermission.mp3` - Pause screen music
- **Image Assets**: Custom skins in `public/` directory:
  - `1.jpg`, `2.jpg`, `3.jpg`, `4.jpg` - Individual ghost skins
  - `5.jpg` - Frightened ghost skin
  - `eyes.png` - Ghost eyes mode skin
  - `map.png` - Background map skin
  - `start.jpg` - Start screen background
- **Fallback Support**: SoundManager provides synth fallback if audio files fail to load
- **Performance**: Optimized for 60 FPS with efficient canvas rendering
- **Deployment**: Built to be responsive and easy to deploy to GitHub Pages/Netlify
