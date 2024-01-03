import type { ColumnLike } from '@decipad/column';
import type { Value } from './Value';
import type { OneResult } from '../Result';
import { Dimension } from '../Dimension';

export interface ColumnLikeValue extends Value, ColumnLike<Value> {
  getData(): Promise<OneResult>;
  lowLevelGet(...keys: number[]): Promise<Value>;

  /** Useful when filtering or sorting.
   * By default the identity function is used and no index changes are assumed to exist */
  indexToLabelIndex?: (index: number) => number | Promise<number>;
  dimensions(): Promise<Dimension[]>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isColumnLike = (thing: any): thing is ColumnLikeValue => {
  const col = thing as ColumnLikeValue;
  return typeof col === 'object' && typeof col?.lowLevelGet === 'function';
};

export const getColumnLike = (
  thing: Value | undefined,
  message = 'panic: expected column-like value'
): ColumnLikeValue => {
  if (!isColumnLike(thing)) {
    throw new Error(message);
  }
  return thing;
};
