import { buildType as t, Type, AST } from '..';
import { TypeName } from '.';
import { Time } from '../date';
import { ErrSpec, InferError } from './InferError';

export type SerializedType =
  | { kind: 'number'; unit: AST.Unit[] | null }
  | { kind: 'scalar'; type: TypeName }
  | { kind: 'date'; date: Time.Specificity }
  | { kind: 'range'; rangeOf: SerializedType }
  | { kind: 'column'; cellType: SerializedType; columnSize: number }
  | { kind: 'tuple'; tupleTypes: SerializedType[]; tupleNames: string[] }
  | { kind: 'time-quantity'; timeUnits: Time.Unit[] }
  | { kind: 'imported-data'; dataUrl: string }
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
      cellType: serializeType(type.cellType),
      columnSize: type.columnSize,
    };
  } else if (type.tupleTypes && type.tupleNames) {
    return {
      kind: 'tuple',
      tupleTypes: type.tupleTypes.map((t) => serializeType(t)),
      tupleNames: type.tupleNames,
    };
  } else if (type.dataUrl) {
    return { kind: 'imported-data', dataUrl: type.dataUrl };
  } else if (type.functionness) {
    return { kind: 'function' };
  } else if (type.errorCause) {
    return { kind: 'type-error', errorCause: type.errorCause.spec };
  }

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
    case 'tuple':
      return t.tuple(
        type.tupleTypes.map((t) => deserializeType(t)),
        type.tupleNames
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
