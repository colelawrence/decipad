import { getDefined } from '@decipad/utils';
import { Type } from './Type';
import type { SerializedType } from '@decipad/language-interfaces';
import * as t from './Type';
import { InferError } from '../InferError';

export function serializeType(type: Type | SerializedType): SerializedType {
  if (!(type instanceof Type)) {
    // Already serialized
    return type;
  }
  // eslint-disable-next-line complexity
  const serializedType = ((): SerializedType | null => {
    if (type.pending) {
      return { kind: 'pending' };
    }
    if (type.cellType) {
      return {
        kind: 'column',
        indexedBy: type.indexedBy,
        cellType: serializeType(type.cellType),
      };
    }
    if (type.tree) {
      return {
        kind: 'tree',
        columnTypes: getDefined(
          type.tree,
          'tree should have tree columnTypes'
        ).map((t) => serializeType(t)),
        columnNames: getDefined(
          type.columnNames,
          'tree should have columnNames'
        ),
      };
    }
    if (type.columnTypes && type.columnNames) {
      return {
        kind: 'table',
        indexName: type.indexName,
        columnTypes: type.columnTypes.map((t) => serializeType(t)),
        columnNames: type.columnNames,
        delegatesIndexTo: type.delegatesIndexTo,
      };
    }
    if (type.rowCellTypes && type.rowCellNames) {
      return {
        kind: 'row',
        rowIndexName: type.rowIndexName,
        rowCellTypes: type.rowCellTypes.map((t) => serializeType(t)),
        rowCellNames: type.rowCellNames,
      };
    }
    if (type.type === 'number') {
      if (type.numberFormat === 'percentage' && type.unit?.length) {
        throw new Error('Cannot serialize a percentage number with a unit');
      }

      if (type.numberFormat) {
        return {
          kind: 'number',
          numberFormat: type.numberFormat,
        };
      }

      if (type.numberError) {
        return {
          kind: 'number',
          unit: type.unit?.length ? type.unit : null,
          numberError: type.numberError,
        };
      }

      return {
        kind: 'number',
        unit: type.unit?.length ? type.unit : null,
      };
    }
    if (type.type === 'boolean') {
      return { kind: 'boolean' };
    }
    if (type.type === 'string') {
      return { kind: 'string' };
    }
    if (type.date) {
      return { kind: 'date', date: type.date };
    }
    if (type.rangeOf) {
      return { kind: 'range', rangeOf: serializeType(type.rangeOf) };
    }
    if (type.nothingness) {
      return { kind: 'nothing' };
    }
    if (type.anythingness) {
      return { kind: 'anything' };
    }
    if (type.functionness) {
      return {
        kind: 'function',
        name: getDefined(type.functionName),
        argNames: type.functionArgNames,
        body: type.functionBody,
        ast: type.node,
      };
    }
    if (type.errorCause) {
      return {
        kind: 'type-error',
        errorCause: type.errorCause.spec,
        errorLocation: type.node
          ? {
              start: type.node.start,
              end: type.node.end,
            }
          : undefined,
      };
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

/* eslint-disable-next-line consistent-return */
export function deserializeType(type: Type | SerializedType): Type {
  if (type instanceof Type) {
    return type;
  }
  return propagateSymbol(
    type,
    // eslint-disable-next-line complexity
    (() => {
      switch (type.kind) {
        case 'number':
          return t.number(type.unit, type.numberFormat, type.numberError);
        case 'string':
          return t.string();
        case 'boolean':
          return t.boolean();
        case 'date':
          return t.date(type.date);
        case 'range':
          return t.range(deserializeType(type.rangeOf));
        case 'column':
        case 'materialized-column':
          return t.column(deserializeType(type.cellType), type.indexedBy);
        case 'materialized-table':
        case 'table': {
          const { columnTypes, columnNames, delegatesIndexTo } = type;
          return t.table({
            columnTypes: columnTypes.map((t) => deserializeType(t)),
            columnNames,
            delegatesIndexTo,
          });
        }
        case 'tree': {
          const { columnTypes, columnNames } = type;
          return t.tree({
            columnTypes: columnTypes.map((t) => deserializeType(t)),
            columnNames,
          });
        }
        case 'row':
          return t.row(
            type.rowCellTypes.map((t) => deserializeType(t)),
            type.rowCellNames,
            type.rowIndexName
          );
        case 'pending':
          return t.pending();
        case 'nothing':
          return t.nothing();
        case 'anything':
          return t.nothing();
        case 'function':
          return t.functionPlaceholder(type.name, type.argNames, type.body);
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
