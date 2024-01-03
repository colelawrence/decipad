import type * as AST from '../AST';

export const getDateSegment = (
  thing: bigint | string | AST.TZInfo | undefined,
  isMonth: boolean
): bigint | null => {
  if (typeof thing === 'string') {
    thing = BigInt(thing.replace(/^0+/, ''));
  }

  if (typeof thing === 'bigint') {
    return thing - (isMonth ? 1n : 0n);
  } else {
    return null;
  }
};
