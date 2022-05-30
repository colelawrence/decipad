import { FractionLike } from '@decipad/fraction';

export type ResultNumber = FractionLike;
export type ResultString = string;
export type ResultBoolean = boolean;
export type ResultDate = bigint;
export type ResultRange =
  | [ResultNumber, ResultNumber]
  | [ResultDate, ResultDate];
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
