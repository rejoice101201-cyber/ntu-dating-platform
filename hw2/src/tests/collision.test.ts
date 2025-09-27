import { describe, it, expect } from 'vitest';
import { aabbIntersect } from '../game/engine';

function entity(x: number, y: number, size = 16) {
  return { id: 'e', position: { x, y }, velocity: { x: 0, y: 0 }, size, direction: 'left', speed: 0 } as any;
}

describe('aabbIntersect', () => {
  it('detects overlap', () => {
    const a = entity(10, 10);
    const b = entity(18, 10);
    expect(aabbIntersect(a, b)).toBe(true);
  });
  it('detects separation', () => {
    const a = entity(0, 0);
    const b = entity(100, 0);
    expect(aabbIntersect(a, b)).toBe(false);
  });
});


