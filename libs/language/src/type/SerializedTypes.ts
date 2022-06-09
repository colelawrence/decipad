import type { Time } from '../date';
import type { ErrSpec } from './InferError';
import type { SerializedType, SerializedUnits } from './SerializedType';

// Groups
export type Column = Readonly<{
  kind: 'column';
  indexedBy: string | null;
  cellType: SerializedType;
  columnSize: number | 'unknown';
}>;
export type Table = Readonly<{
  kind: 'table';
  indexName: string | null;
  tableLength: number | 'unknown';
  columnTypes: SerializedType[];
  columnNames: string[];
}>;
export type Row = Readonly<{
  kind: 'row';
  rowCellTypes: SerializedType[];
  rowCellNames: string[];
}>;

// Non-groups
export type Number = Readonly<{ kind: 'number'; unit: SerializedUnits | null }>;
export type Boolean = Readonly<{ kind: 'boolean' }>;
export type String = Readonly<{ kind: 'string' }>;
export type Date = Readonly<{ kind: 'date'; date: Time.Specificity }>;
export type Range = Readonly<{ kind: 'range'; rangeOf: SerializedType }>;

// Oddball
export type Nothing = Readonly<{ kind: 'nothing' }>; // No-op
export type Function = Readonly<{ kind: 'function' }>;
export type TypeError = Readonly<{ kind: 'type-error'; errorCause: ErrSpec }>;
