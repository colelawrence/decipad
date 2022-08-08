/* eslint-disable @typescript-eslint/ban-types */
import type { Time } from '../date';
import type { AST } from '../parser';
import type { Unit } from '.';
import type { ErrSpec } from './InferError';
import type { SerializedType } from './SerializedType';

type SType<Contents> = Readonly<Contents & { symbol?: string }>;

// Groups
export type Column = SType<{
  kind: 'column';
  indexedBy: string | null;
  cellType: SerializedType;
  columnSize: number | 'unknown';
}>;
export type Table = SType<{
  kind: 'table';
  indexName: string | null;
  tableLength: number | 'unknown';
  columnTypes: SerializedType[];
  columnNames: string[];
}>;
export type Row = SType<{
  kind: 'row';
  rowCellTypes: SerializedType[];
  rowCellNames: string[];
}>;

// Non-groups
export type Number =
  | SType<{
      kind: 'number';
      unit: Unit[] | null;
      numberFormat?: null;
    }>
  | SType<{
      kind: 'number';
      numberFormat: AST.NumberFormat;
      unit?: null;
    }>;
export type Boolean = SType<{ kind: 'boolean' }>;
export type String = SType<{ kind: 'string' }>;
export type Date = SType<{ kind: 'date'; date: Time.Specificity }>;
export type Range = SType<{ kind: 'range'; rangeOf: SerializedType }>;

// Oddball
export type Nothing = SType<{ kind: 'nothing' }>; // No-op
export type Anything = SType<{ kind: 'anything' }>; // Top type
export type Function = SType<{
  kind: 'function';
  name: string;
  argCount?: number;
  ast?: AST.Node | null;
}>;
export type TypeError = SType<{ kind: 'type-error'; errorCause: ErrSpec }>;
