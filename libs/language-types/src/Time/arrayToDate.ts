import type { AST } from '@decipad/language-interfaces';
import { getDateSegment } from './getDateSegment';

export function arrayToDate(
  segments: (string | bigint | AST.TZInfo | undefined)[]
): bigint | undefined {
  const nameAndNumber: [string, string | bigint | AST.TZInfo | undefined][] = [
    ['year', segments[0]],
    ['month', segments[1]],
    ['day', segments[2]],
    ['hour', segments[3]],
    ['minute', segments[4]],
    ['second', segments[5]],
    ['millisecond', segments[6]],
  ];

  const dateArgs: bigint[] = [];
  for (const [segName, segValue] of nameAndNumber) {
    const segNumber = getDateSegment(segValue, segName === 'month');

    if (segNumber != null) {
      dateArgs.push(segNumber);
    } else {
      break;
    }
  }

  const utcArgs = [
    Number(dateArgs[0]),
    Number(dateArgs[1] || 0n),
    ...dateArgs.slice(2).map(Number),
  ];
  const d = Date.UTC(utcArgs[0], utcArgs[1], ...utcArgs.slice(2));
  if (Number.isNaN(d)) return undefined;

  return BigInt(d);
}
