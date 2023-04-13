import { ColumnLike } from '@decipad/column';
import { Interpreter } from '..';
import { Dimension } from '../lazy';
import type {
  UnknownValue,
  NumberValue,
  StringValue,
  BooleanValue,
  DateValue,
  Range,
  Table,
  Row,
} from './index';

export interface Value {
  getData(): Interpreter.OneResult;
}

export interface ColumnLikeValue extends Value, ColumnLike<Value> {
  getData(): Interpreter.OneResult;
  lowLevelGet(...keys: number[]): Value;

  /** Useful when filtering or sorting.
   * By default the identity function is used and no index changes are assumed to exist */
  indexToLabelIndex?: (index: number) => number;
  dimensions: Dimension[];
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

export type NonColumn =
  | typeof UnknownValue
  | NumberValue
  | StringValue
  | BooleanValue
  | Range
  | DateValue
  | Table
  | Row;
