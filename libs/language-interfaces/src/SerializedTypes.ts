/* eslint-disable @typescript-eslint/ban-types */
import type { Unit } from './Unit';
import type * as Time from './Time';
import type * as AST from './AST';
import type { ErrSpec } from './InferError';

type Common = { symbol?: string; node?: AST.Statement | AST.Expression };

export type SerializedType =
  // Groups
  | Column
  | MaterializedColumn
  | Table
  | Tree
  | MaterializedTable
  | Row
  | Metric
  // Non-groups
  | Number
  | Boolean
  | String
  | Date
  | Range
  | Trend

  // Oddball
  | Pending
  | Nothing // No-op
  | Anything
  | Function
  | TypeError;

export type SerializedTypeKind = SerializedType['kind'];

// Groups
export type Column = {
  readonly kind: 'column';
  readonly indexedBy: string | null;
  readonly cellCount?: number;
  readonly atParentIndex: number | null;
  cellType: SerializedType;
} & Common;

export type MaterializedColumn = {
  readonly kind: 'materialized-column';
  readonly indexedBy: string | null;
  readonly cellType: SerializedType;
  readonly atParentIndex: number | null;
} & Common;

export type Table = {
  readonly kind: 'table';
  indexName: string | null;
  readonly delegatesIndexTo?: string | null;
  columnTypes: SerializedType[];
  readonly columnNames: string[];
  readonly rowCount?: number;
} & Common;

export type Metric = {
  readonly kind: 'metric';
  readonly granularity: Time.Specificity;
  readonly valueType: Number;
} & Common;

export type Tree = {
  readonly kind: 'tree';
  columnTypes: SerializedType[];
  readonly columnNames: string[];
} & Common;

export type MaterializedTable = {
  readonly kind: 'materialized-table';
  indexName: string | null;
  readonly delegatesIndexTo?: string | null;
  columnTypes: SerializedType[];
  readonly columnNames: string[];
  readonly rowCount?: number;
} & Common;

export type Row = {
  readonly kind: 'row';
  readonly rowIndexName: string | null;
  readonly rowCellTypes: SerializedType[];
  readonly rowCellNames: string[];
} & Common;

export type Trend = {
  readonly kind: 'trend';
  trendOf: SerializedType;
} & Common;

// Non-groups
export type Number =
  | ({
      readonly kind: 'number';
      unit?: Unit[] | null;
      readonly numberError?: 'month-day-conversion';
      readonly numberFormat?: null;
    } & Common)
  | ({
      readonly kind: 'number';
      readonly numberFormat: AST.NumberFormat;
      readonly unit?: null;
      readonly numberError?: null;
    } & Common);
export type Boolean = { readonly kind: 'boolean' } & Common;
export type String = { readonly kind: 'string' } & Common;
export type Date = {
  readonly kind: 'date';
  readonly date: Time.Specificity;
} & Common;
export type Range = {
  readonly kind: 'range';
  readonly rangeOf: SerializedType;
} & Common;

// Oddball
export type Nothing = { readonly kind: 'nothing' } & Common; // No-op
export type Anything = { readonly kind: 'anything' } & Common; // Top type
export type Pending = { readonly kind: 'pending' } & Common; // Top type
export type Function = {
  readonly kind: 'function';
  readonly name: string;
  readonly argNames?: string[];
  readonly body?: AST.Block;
  readonly ast?: AST.Node | null;
} & Common;
export type TypeError = {
  readonly kind: 'type-error';
  errorCause: ErrSpec;
  readonly errorLocation?: {
    start?: AST.Pos;
    end?: AST.Pos;
  };
} & Common;
