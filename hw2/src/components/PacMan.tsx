import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PacManProps {
  x?: number;
  y?: number;
  size?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

const PacMan: React.FC<PacManProps> = ({
  x = 100,
  y = 100,
  size = 50,
  direction = 'right',
  isAnimating = true,
  onAnimationComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [isMounted, setIsMounted] = useState(true);

  // Animation configuration - 0.5 seconds per cycle
  const ANIMATION_DURATION = 500; // 0.5 seconds
  const ANIMATION_SPEED = 0.01; // Controls animation speed

  // Load the Pac-Man image
  const loadImage = useCallback(() => {
    if (imageRef.current) return; // Already loaded
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);
      console.log('Pac-Man image loaded successfully');
    };
    img.onerror = () => {
      console.error('Failed to load Pac-Man image at /packman.png');
      setIsImageLoaded(false);
    };
    img.src = '/packman.png'; // Image from public folder
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!isMounted || !isAnimating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size * 2;
    canvas.height = size * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate mouth animation based on time
    const progress = (animationTime % ANIMATION_DURATION) / ANIMATION_DURATION;
    const mouthAngle = Math.PI / 3; // 60 degrees base angle
    const mouthAnimation = Math.sin(progress * Math.PI * 2) * 0.3 + 0.7; // 0.7 to 1.0 range
    const currentMouthAngle = mouthAngle * mouthAnimation;

    // Save context
    ctx.save();

    // Move to center
    ctx.translate(size, size);

    // Rotate based on direction
    const rotationAngle = {
      'right': 0,
      'left': Math.PI,
      'up': -Math.PI / 2,
      'down': Math.PI / 2
    }[direction];
    ctx.rotate(rotationAngle);

    // Try to draw the image first
    if (isImageLoaded && imageRef.current) {
      // Draw the base image
      ctx.drawImage(imageRef.current, -size, -size, size * 2, size * 2);

      // Create mouth opening effect using composite operation
      ctx.save();
      
      // Calculate mouth opening angles based on direction
      let startAngle = 0;
      let endAngle = Math.PI * 2;
      
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

      // Create mouth opening by drawing over with background color
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, size, startAngle, endAngle);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    } else {
      // Fallback: draw a simple Pac-Man shape
      // Draw Pac-Man body
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();

      // Draw mouth opening
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, size, -currentMouthAngle / 2, currentMouthAngle / 2);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Update animation time
    setAnimationTime(prev => prev + ANIMATION_SPEED * 16); // 16ms per frame at 60fps

  }, [animationTime, direction, isAnimating, isMounted, isImageLoaded, size]);

  // Load image on mount
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // Start/stop animation based on isAnimating prop
  useEffect(() => {
    if (isAnimating && isMounted) {
      const animateLoop = () => {
        animate();
        animationRef.current = requestAnimationFrame(animateLoop);
      };
      animateLoop();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animate, isMounted]);

  // Handle component unmounting
  useEffect(() => {
    return () => {
      setIsMounted(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        // Reset animation on spacebar press
        setAnimationTime(0);
        console.log('Animation reset by spacebar');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size,
        top: y - size,
        width: size * 2,
        height: size * 2,
        pointerEvents: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          border: '1px solid white',
          backgroundColor: '#000'
        }}
      />
      {!isImageLoaded && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '12px'
        }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default PacMan;
