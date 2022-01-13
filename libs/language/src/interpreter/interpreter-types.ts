import Fraction from '@decipad/fraction';

export type ResultNumber = Fraction;
export type ResultString = string;
export type ResultBoolean = boolean;
export type ResultDate = bigint;
export type ResultRange =
  | [ResultNumber, ResultNumber]
  | [ResultDate, ResultDate];
export type ResultTimeQuantity = [string, bigint][];
export type ResultColumn = OneResult[];
export type ResultRow = OneResult[];
export type ResultTable = OneResult[][];
export type ResultUnknown = symbol;

export type OneResult =
  | ResultNumber
  | ResultString
  | ResultBoolean
  | ResultDate
  | ResultRange
  | ResultTimeQuantity
  | ResultColumn
  | ResultRow
  | ResultTable
  | ResultUnknown;
