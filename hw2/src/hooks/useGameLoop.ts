import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (deltaMs: number) => void, running: boolean) {
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return () => {};
    const tick = (time: number) => {
      if (lastRef.current == null) lastRef.current = time;
      const delta = time - lastRef.current;
      lastRef.current = time;
      callback(delta);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); lastRef.current = null; };
  }, [callback, running]);
}


