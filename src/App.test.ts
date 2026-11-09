import { describe, it, expect } from 'vitest';

describe('Development Environment Verification', () => {
  it('runs vitest successfully with ES2022+ support', () => {
    const sum = (a: number, b: number): number => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
