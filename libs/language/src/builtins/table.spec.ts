import { approximateSubsetSumIndices } from './table';

describe('approximateSubsetSumIndices', () => {
  it('finds the optimal solution for a simple problem', () => {
    expect(approximateSubsetSumIndices(40, [[5, 5, 10, 10, 25]], 0)).toEqual([
      0, 2, 4,
    ]);
  });

  it('finds the best imperfect solution', () => {
    expect(approximateSubsetSumIndices(40, [[10, 20, 25]], 0)).toEqual([0, 2]);
  });

  it('uses the correct column', () => {
    expect(
      approximateSubsetSumIndices(
        40,
        [
          [40, 5],
          [10, 40],
          [40, 10],
        ],
        1
      )
    ).toEqual([1]);
  });
});
