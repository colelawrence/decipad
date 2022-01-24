import { getDefined } from '@decipad/utils';
import { buildType as t, Type } from '..';
import { Time } from '../date';
import { F } from '../utils';
import { ErrSpec, InferError } from './InferError';
import { TUnit, TUnits, Units } from './unit-type';

export type SerializedUnit = TUnit<string>;
export type SerializedUnits = TUnits<string>;

export type SerializedType = Readonly<
  | { kind: 'number'; unit: SerializedUnits | null }
  | { kind: 'boolean' }
  | { kind: 'string' }
  | { kind: 'date'; date: Time.Specificity }
  | { kind: 'range'; rangeOf: SerializedType }
  | {
      kind: 'column';
      indexedBy: string | null;
      cellType: SerializedType;
      columnSize: number | 'unknown';
    }
  | {
      kind: 'table';
      indexName: string | null;
      tableLength: number | 'unknown';
      columnTypes: SerializedType[];
      columnNames: string[];
    }
  | { kind: 'row'; rowCellTypes: SerializedType[]; rowCellNames: string[] }
  | { kind: 'time-quantity'; timeUnits: Time.Unit[] }
  | { kind: 'function' }
  | { kind: 'type-error'; errorCause: ErrSpec }
>;

export type SerializedTypeKind = SerializedType['kind'];

export function serializeUnit(unit: Units | null): SerializedUnits | null {
  if (unit == null) {
    return unit;
  }
  return {
    type: 'units',
    args: unit.args.map((u) => ({
      ...u,
      multiplier: u.multiplier.toString(),
      exp: u.exp.toString(),
    })),
  };
}

export function serializeType(type: Type): SerializedType {
  if (type.type === 'number') {
    return { kind: 'number', unit: serializeUnit(type.unit) };
  } else if (type.type === 'boolean') {
    return { kind: 'boolean' };
  } else if (type.type === 'string') {
    return { kind: 'string' };
  } else if (type.date) {
    return { kind: 'date', date: type.date };
  } else if (type.type === 'time-quantity') {
    return {
      kind: 'time-quantity',
      timeUnits: getDefined(
        type.unit?.args.map((unit) => unit.unit as Time.Unit)
      ),
    };
  } else if (type.rangeOf) {
    return { kind: 'range', rangeOf: serializeType(type.rangeOf) };
  } else if (type.cellType && type.columnSize) {
    return {
      kind: 'column',
      indexedBy: type.indexedBy,
      cellType: serializeType(type.cellType),
      columnSize: type.columnSize,
    };
  } else if (type.columnTypes && type.columnNames && type.tableLength) {
    return {
      kind: 'table',
      indexName: type.indexName,
      tableLength: type.tableLength,
      columnTypes: type.columnTypes.map((t) => serializeType(t)),
      columnNames: type.columnNames,
    };
  } else if (type.rowCellTypes && type.rowCellNames) {
    return {
      kind: 'row',
      rowCellTypes: type.rowCellTypes.map((t) => serializeType(t)),
      rowCellNames: type.rowCellNames,
    };
  } else if (type.functionness) {
    return { kind: 'function' };
  } else if (type.errorCause) {
    return { kind: 'type-error', errorCause: type.errorCause.spec };
  }

  /* istanbul ignore next */
  console.error(type);
  throw new Error(`panic: serializing invalid type ${type.type}`);
}

export function deserializeUnit(unit: SerializedUnits | null): Units | null {
  if (unit == null) {
    return unit;
  }
  return {
    type: 'units',
    args: unit.args.map((u) => ({
      ...u,
      multiplier: F(u.multiplier),
      exp: F(u.exp),
    })),
  };
}

/* eslint-disable-next-line consistent-return */
export function deserializeType(type: SerializedType): Type {
  switch (type.kind) {
    case 'number':
      return t.number(deserializeUnit(type.unit));
    case 'string':
      return t.string();
    case 'boolean':
      return t.boolean();
    case 'date':
      return t.date(type.date);
    case 'range':
      return t.range(deserializeType(type.rangeOf));
    case 'column':
      return t.column(deserializeType(type.cellType), type.columnSize);
    case 'table':
      const { tableLength, columnTypes, columnNames } = type;
      return t.table({
        length: tableLength,
        columnTypes: columnTypes.map((t) => deserializeType(t)),
        columnNames,
      });
    case 'row':
      return t.row(
        type.rowCellTypes.map((t) => deserializeType(t)),
        type.rowCellNames
      );
    case 'time-quantity':
      return t.timeQuantity(type.timeUnits);
    case 'function':
      return t.functionPlaceholder();
    case 'type-error':
      return t.impossible(new InferError(type.errorCause));
  }
}
