import DeciNumber from '@decipad/number';

export type ResultNumber = DeciNumber;
export type ResultString = string;
export type ResultBoolean = boolean;
export type ResultDate = bigint | undefined;
export type ResultRange = [ResultNumber, ResultNumber] | [bigint, bigint];
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
  | ResultColumn
  | ResultRow
  | ResultTable
  | ResultUnknown;
