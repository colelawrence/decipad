import DeciNumber from '@decipad/number';

export type ResultGenerator = (
  start?: number,
  end?: number
) => AsyncGenerator<OneResult>;

export type ResultNumber = DeciNumber;
export type ResultString = string;
export type ResultBoolean = boolean;
export type ResultDate = bigint | undefined;
export type ResultRange = [ResultNumber, ResultNumber] | [bigint, bigint];
export type ResultColumn = ResultGenerator;
export type ResultMaterializedColumn = OneResult[];
export type ResultRow = OneResult[];
export type ResultTable = Array<ResultColumn>;
export type ResultMaterializedTable = ResultMaterializedColumn[];
export type ResultUnknown = symbol;

export type OneMaterializedResult =
  | ResultNumber
  | ResultString
  | ResultBoolean
  | ResultDate
  | ResultRange
  | ResultMaterializedColumn
  | ResultRow
  | ResultMaterializedTable
  | ResultUnknown;

export type OneResult =
  | ResultNumber
  | ResultString
  | ResultBoolean
  | ResultDate
  | ResultRange
  | ResultColumn
  | ResultMaterializedColumn
  | ResultRow
  | ResultTable
  | ResultMaterializedTable
  | ResultUnknown;
