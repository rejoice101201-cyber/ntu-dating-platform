import { useEffect, useState } from 'react';
import type { InputState } from '../types/GameTypes';

export function useKeyControls(): InputState {
  const [input, setInput] = useState<InputState>({ 
    up: false, 
    down: false, 
    left: false, 
    right: false, 
    pause: false, 
    space: false, 
    restart: false
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) setInput(s => ({ ...s, up: true }));
      if (['arrowdown', 's'].includes(key)) setInput(s => ({ ...s, down: true }));
      if (['arrowleft', 'a'].includes(key)) setInput(s => ({ ...s, left: true }));
      if (['arrowright', 'd'].includes(key)) setInput(s => ({ ...s, right: true }));
      if (key === 'q') setInput(s => ({ ...s, pause: true }));
      if (key === ' ') setInput(s => ({ ...s, space: true }));
      if (key === 'r') setInput(s => ({ ...s, restart: true }));
    };
    const onUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) setInput(s => ({ ...s, up: false }));
      if (['arrowdown', 's'].includes(key)) setInput(s => ({ ...s, down: false }));
      if (['arrowleft', 'a'].includes(key)) setInput(s => ({ ...s, left: false }));
      if (['arrowright', 'd'].includes(key)) setInput(s => ({ ...s, right: false }));
      if (key === 'q') setInput(s => ({ ...s, pause: false }));
      if (key === ' ') setInput(s => ({ ...s, space: false }));
      if (key === 'r') setInput(s => ({ ...s, restart: false }));
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  return input;
}


