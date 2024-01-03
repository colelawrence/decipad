import type { BooleanValue } from './Boolean';
import type { DateValue } from './Date';
import type { NumberValue } from './Number';
import type { StringValue } from './String';
import type { UnknownValue } from './Unknown';
import type { Row } from './Row';
import type { Table } from './Table';
import type { Range } from './Range';

export type NonColumn =
  | typeof UnknownValue
  | NumberValue
  | StringValue
  | BooleanValue
  | Range
  | DateValue
  | Table
  | Row;
