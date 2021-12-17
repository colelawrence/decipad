import Fraction from '@decipad/fraction';

export type ResultDate = bigint;
export type ResultNumber = Fraction;
export type ResultRange = [ResultScalar, ResultScalar];
export type ResultTimeQuantity = [string, bigint][];
export type ResultScalar = bigint | boolean | string | ResultNumber | symbol;
export type ResultColumn = OneResult[];
export type ResultTable = OneResult[][];

export type OneResult =
  | ResultScalar
  | ResultColumn
  | ResultRange
  | ResultTimeQuantity
  | ResultTable;
