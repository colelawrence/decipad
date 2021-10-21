import { buildType as t, Type, AST } from '..';
import { TypeName } from '.';
import { Time } from '../date';
import { ErrSpec, InferError } from './InferError';

export type SerializedType =
  | { kind: 'number'; unit: AST.Unit[] | null }
  | { kind: 'scalar'; type: TypeName }
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
  | { kind: 'imported-data'; indexName: string | null; dataUrl: string }
  | { kind: 'function' }
  | { kind: 'type-error'; errorCause: ErrSpec };

export function serializeType(type: Type): SerializedType {
  if (type.type === 'number') {
    return { kind: 'number', unit: type.unit };
  } else if (type.type) {
    return { kind: 'scalar', type: type.type };
  } else if (type.date) {
    return { kind: 'date', date: type.date };
  } else if (type.timeUnits) {
    return { kind: 'time-quantity', timeUnits: type.timeUnits };
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
  } else if (type.dataUrl) {
    return {
      kind: 'imported-data',
      indexName: type.indexName,
      dataUrl: type.dataUrl,
    };
  } else if (type.functionness) {
    return { kind: 'function' };
  } else if (type.errorCause) {
    return { kind: 'type-error', errorCause: type.errorCause.spec };
  }

  /* istanbul ignore next */
  throw new Error('panic: serializing invalid type');
}

/* eslint-disable-next-line consistent-return */
export function deserializeType(type: SerializedType): Type {
  switch (type.kind) {
    case 'number':
      return t.number(type.unit);
    case 'scalar':
      return t.scalar(type.type);
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
    case 'imported-data':
      return t.importedData(type.dataUrl);
    case 'function':
      return t.functionPlaceholder();
    case 'type-error':
      return t.impossible(new InferError(type.errorCause));
  }
}
