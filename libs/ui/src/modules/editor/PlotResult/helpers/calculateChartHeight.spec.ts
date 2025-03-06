import { describe, expect, it } from 'vitest';
import { calculateChartHeight } from './calculateChartHeight';

describe('calculateChartHeight', () => {
  const baseHeight = 100;

  it('should return 35% of base height for small size', () => {
    expect(calculateChartHeight('small', baseHeight)).toBe(baseHeight * 0.6);
  });

  it('should return base height for medium size', () => {
    expect(calculateChartHeight('medium', baseHeight)).toBe(baseHeight);
  });

  it('should return double base height for large size', () => {
    expect(calculateChartHeight('large', baseHeight)).toBe(baseHeight * 2);
  });
});
