import type { Value } from '@decipad/language-interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isColumnLike = (thing: any): thing is Value.ColumnLikeValue => {
  const col = thing as Value.ColumnLikeValue;
  return (
    col != null &&
    typeof col === 'object' &&
    typeof col?.lowLevelGet === 'function'
  );
};

export const getColumnLike = (
  thing: Value.Value | undefined,
  message = 'panic: expected column-like value'
): Value.ColumnLikeValue => {
  if (!isColumnLike(thing)) {
    console.error('expected column-like value', thing);
    throw new Error(message);
  }
  return thing;
};
