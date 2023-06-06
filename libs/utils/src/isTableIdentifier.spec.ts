import { isTableIdentifier } from './isTableIdentifier';

describe('isTableIdentifier', () => {
  it('should parse a table', () => {
    expect(isTableIdentifier('Dogs.Names')).toStrictEqual(['Dogs', 'Names']);
  });

  it('A.B', () => {
    expect(isTableIdentifier('A.B')).toStrictEqual(['A', 'B']);
  });

  const cases = [
    undefined,
    'Variable',
    'function(a)',
    'A.B.C',
    'A.',
    '.B',
    '.',
    ' .',
    '. ',
    'A .',
    'A . ',
    'A. ',
    'A.B ',
    ' A.B',
    'A. B',
    'A .B',
    ' A. B',
    ' A.B ',
    ' .B',
    ' . B',
    '. B',
    '.B',
  ];

  test.each(cases)('given %p, returns []', (arg) => {
    expect(isTableIdentifier(arg)).toStrictEqual([]);
  });
});
