import type { Type } from '@decipad/language-interfaces';
import { decodeAST } from './decodeAST';
import { decodeUnit } from './decodeUnit';
import type { SerializedUnit } from '../types/serializedTypes';
import { decodeInferError } from './decodeInferError';

export const decodeType = (type: Type): Type => {
  return {
    ...type,
    node: type.node ? decodeAST(type.node) : null,
    errorCause: type.errorCause
      ? decodeInferError(decodeType)(type.errorCause)
      : null,
    unit: type.unit
      ? (type.unit as unknown as Array<SerializedUnit>).map(decodeUnit)
      : null,
    rangeOf: type.rangeOf ? decodeType(type.rangeOf) : null,
    cellType: type.cellType ? decodeType(type.cellType) : null,
    columnTypes: type.columnTypes ? type.columnTypes.map(decodeType) : null,
    rowCellTypes: type.rowCellTypes ? type.rowCellTypes.map(decodeType) : null,
    functionBody: type.functionBody ? decodeAST(type.functionBody) : undefined,
  } as Type;
};
