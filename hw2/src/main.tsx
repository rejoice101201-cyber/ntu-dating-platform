import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import App from './App.tsx'

// Preload Pac-Man skin image if present in public, with fallbacks
const pacImg = new Image();
pacImg.decoding = 'async';
pacImg.src = '/pacman.jpg';
pacImg.onerror = () => {
  pacImg.onerror = null as any;
  pacImg.src = '/pacman.png';
  pacImg.onerror = () => {
    // Tiny inline SVG fallback (yellow circle with wedge mouth)
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<defs><clipPath id="m"><path d="M50,50 L100,35 A50,50 0 1 1 100,65 Z"/></clipPath></defs>' +
      '<circle cx="50" cy="50" r="50" fill="#ffff00" clip-path="url(#m)"/></svg>';
    pacImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };
};
(window as any).__pacmanImg = pacImg;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
