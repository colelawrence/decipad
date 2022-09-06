import FFraction, { toFraction } from '@decipad/fraction';

import type { DeciNumberPart } from './formatNumber';

export const large = toFraction(1_000_000_000_000_000_000_000n);
export const small = toFraction(1n, 1_000_000_000_000_000_000_000n);

export const isEdgeCaseNumber = (
  f: FFraction
): 'small' | 'large' | undefined => {
  const abs = f.abs();

  if (abs.compare(large) >= 0) {
    return 'large';
  }
  if (abs.compare(0) !== 0 && abs.compare(small) <= 0) {
    return 'small';
  }
  return undefined;
};

export const formatEdgeCaseNumber = (
  f: FFraction,
  places: number
): DeciNumberPart[] => {
  const result = f.toString(places);

  const repeating = result.match(/^(\d+)\.(\d*\(\d+\))$/);
  if (repeating) {
    const [, integer, fraction] = repeating;
    return [
      { type: 'integer', value: integer },
      { type: 'decimal', value: '.' },
      {
        type: 'fraction',
        value: fraction.replace(/[()]/g, '').repeat(4).slice(0, places),
      },
      { type: 'ellipsis', value: '...' },
    ];
  }

  const simpleDecimal = result.match(/^(\d+)\.(\d+)$/);
  if (simpleDecimal) {
    const [, integer, fraction] = simpleDecimal;
    return [
      { type: 'integer', value: integer },
      { type: 'decimal', value: '.' },
      { type: 'fraction', value: fraction },
    ];
  }

  return [{ type: 'integer', value: result }];
};
