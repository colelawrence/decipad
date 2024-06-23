import type { Type } from '@decipad/language-interfaces';
import { encodeAST } from './encodeAST';
import { encodeUnit } from './encodeUnit';
import { encodeInferError } from './encodeInferError';
import { encodeErrorSpec } from './encodeErrorSpec';

export const encodeType = (type: Type): Type => {
  return {
    ...type,
    node: type.node ? encodeAST(type.node) : null,
    errorCause: type.errorCause
      ? encodeInferError(encodeErrorSpec(encodeType))(type.errorCause)
      : null,
    unit: type.unit ? type.unit.map(encodeUnit) : null,
    rangeOf: type.rangeOf ? encodeType(type.rangeOf) : null,
    cellType: type.cellType ? encodeType(type.cellType) : null,
    columnTypes: type.columnTypes ? type.columnTypes.map(encodeType) : null,
    rowCellTypes: type.rowCellTypes ? type.rowCellTypes.map(encodeType) : null,
    functionBody: type.functionBody ? encodeAST(type.functionBody) : undefined,
  } as Type;
};
