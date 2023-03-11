/* eslint-disable @typescript-eslint/ban-types */
import type { Time } from '../date';
import type { AST } from '../parser';
import type { Unit } from '.';
import type { ErrSpec } from './InferError';
import type { SerializedType } from './SerializedType';
import type { Pos } from '../parser/ast-types';

type Common = { symbol?: string; node?: AST.Statement | AST.Expression };

// Groups
export type Column = {
  readonly kind: 'column';
  readonly indexedBy: string | null;
  readonly cellType: SerializedType;
  readonly columnSize: number | 'unknown';
} & Common;
export type Table = {
  readonly kind: 'table';
  readonly indexName: string | null;
  readonly columnTypes: SerializedType[];
  readonly columnNames: string[];
} & Common;
export type Row = {
  readonly kind: 'row';
  readonly rowIndexName: string | null;
  readonly rowCellTypes: SerializedType[];
  readonly rowCellNames: string[];
} & Common;

// Non-groups
export type Number =
  | ({
      readonly kind: 'number';
      readonly unit: Unit[] | null;
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
export type Function = {
  readonly kind: 'function';
  readonly name: string;
  readonly argCount?: number;
  readonly ast?: AST.Node | null;
} & Common;
export type TypeError = {
  readonly kind: 'type-error';
  readonly errorCause: ErrSpec;
  readonly errorLocation?: {
    start?: Pos;
    end?: Pos;
  };
} & Common;
