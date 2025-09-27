import React, { useRef, useEffect, useState } from 'react';

interface PacManAnimatedProps {
  x: number;
  y: number;
  size: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isAnimating?: boolean;
}

const PacManAnimated: React.FC<PacManAnimatedProps> = ({
  x,
  y,
  size,
  direction,
  isAnimating = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size * 2;
    canvas.height = size * 2;

    let animationId: number;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate mouth animation
      const time = Date.now() * 0.003;
      const mouthAngle = Math.PI / 3;
      const mouthAnimation = Math.sin(time) * 0.3 + 0.7;
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

      // Draw Pac-Man body (yellow circle)
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();

      // Draw mouth opening (black wedge)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, size, -currentMouthAngle / 2, currentMouthAngle / 2);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Add eye
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, -size * 0.3, size * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Continue animation if animating
      if (isAnimating) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [size, direction, isAnimating]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size,
        top: y - size,
        width: size * 2,
        height: size * 2,
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
};

export default PacManAnimated;
