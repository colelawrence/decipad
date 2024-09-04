import { describe, it, expect } from 'vitest';
import { calculateLabelPosition } from '.';
import fixtureData from './calculateLabelPosition.fixtures.json'; // Adjust the path if needed

describe('calculateLabelPosition', () => {
  fixtureData.forEach((fixture, index) => {
    const { input, output } = fixture;

    it(`calculates label position correctly for fixture ${index + 1}`, () => {
      const result = calculateLabelPosition(input as any);

      expect(result).toEqual(output);
    });
  });
});
