import { buildType as t, Type } from '..';
import { F } from '../utils';
import { InferError } from './InferError';
import {
  SerializedType,
  SerializedTypes,
  SerializedTypeKind,
  SerializedUnits,
  SerializedUnit,
} from './SerializedType';
import { Units } from './unit-type';

export type {
  SerializedType,
  SerializedTypes,
  SerializedTypeKind,
  SerializedUnits,
  SerializedUnit,
};

// TODO: is this just a lokey type cast?
export function serializeUnit(unit: Units | null): SerializedUnits | null {
  return unit;
}

export function serializeType(type: Type): SerializedType {
  const serializedType = ((): SerializedType | null => {
    if (type.cellType && type.columnSize) {
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
    } else if (type.type === 'number') {
      if (type.numberFormat === 'percentage' && type.unit) {
        throw new Error('Cannot serialize a percentage number with a unit');
      }

      if (type.numberFormat) {
        return {
          kind: 'number',
          numberFormat: type.numberFormat,
        };
      }

      return {
        kind: 'number',
        unit: serializeUnit(type.unit),
      };
    } else if (type.type === 'boolean') {
      return { kind: 'boolean' };
    } else if (type.type === 'string') {
      return { kind: 'string' };
    } else if (type.date) {
      return { kind: 'date', date: type.date };
    } else if (type.rangeOf) {
      return { kind: 'range', rangeOf: serializeType(type.rangeOf) };
    } else if (type.nothingness) {
      return { kind: 'nothing' };
    } else if (type.anythingness) {
      return { kind: 'anything' };
    } else if (type.functionness) {
      return { kind: 'function' };
    } else if (type.errorCause) {
      return { kind: 'type-error', errorCause: type.errorCause.spec };
    }

    return null;
  })();

  if (serializedType != null) {
    return propagateSymbol(type, serializedType);
  }

  /* istanbul ignore next */
  console.error(type);
  throw new Error(`panic: serializing invalid type ${type.type}`);
}

export function deserializeUnit(
  unit: SerializedUnits | undefined | null
): Units | undefined {
  if (unit == null) {
    return undefined;
  }
  return {
    type: 'units',
    args: unit.args.map((u) => ({
      ...u,
      multiplier: F(u.multiplier),
      exp: F(u.exp),
      aliasFor: u.aliasFor ? deserializeUnit(u.aliasFor) : undefined,
    })),
  };
}

/* eslint-disable-next-line consistent-return */
export function deserializeType(type: SerializedType): Type {
  return propagateSymbol(
    type,
    (() => {
      switch (type.kind) {
        case 'number':
          return t.number(deserializeUnit(type.unit), type.numberFormat);
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
        case 'nothing':
          return t.nothing();
        case 'anything':
          return t.nothing();
        case 'function':
          return t.functionPlaceholder();
        case 'type-error':
          return t.impossible(new InferError(type.errorCause));
      }
    })()
  );
}

/** give the symbol in fromT (if any) to toT */
function propagateSymbol<T extends Type | SerializedType>(
  fromT: Type | SerializedType,
  toT: T
): T {
  if (fromT.symbol) {
    return { ...toT, symbol: fromT.symbol };
  }
  return toT;
}
