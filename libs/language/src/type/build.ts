import { N } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { InferError, PrimitiveTypeName, Type } from '.';
import type { AST, Time } from '..';
import { timeUnitFromUnit } from '../date';
import { Unit } from './unit-type';

const primitive = (type: PrimitiveTypeName) =>
  produce(new Type(), (t) => {
    t.type = type;
  });

export const number = (
  unit: Unit[] | null = null,
  numberFormat: Type['numberFormat'] | undefined = undefined,
  numberError: Type['numberError'] | undefined = undefined
) =>
  produce(primitive('number'), (t) => {
    if (unit != null && numberFormat != null) {
      throw new Error('Cannot specify both unit and numberFormat');
    }
    t.unit = unit?.length ? unit : null;
    t.numberFormat = numberFormat ?? null;
    t.numberError = numberError ?? null;
  });

export const string = () => primitive('string');

export const boolean = () => primitive('boolean');

export const range = (rangeContents: Type) =>
  produce(new Type(), (t) => {
    t.rangeOf = rangeContents;
  });

export const date = (specificity: Time.Specificity) =>
  produce(new Type(), (t) => {
    t.date = specificity;
  });

export const timeQuantity = (timeUnit: Unit | string) =>
  produce(primitive('number'), (numberType) => {
    numberType.unit = [
      {
        unit: timeUnitFromUnit(timeUnit),
        exp: N(1),
        multiplier: N(1),
        known: true,
      },
    ];
  });

interface BuildTableArgs {
  indexName?: string | null;
  columnTypes: Type[];
  columnNames: string[];
}

export const table = ({
  indexName,
  columnTypes,
  columnNames,
}: BuildTableArgs) => {
  return produce(new Type(), (t) => {
    t.indexName = indexName ?? null;
    t.columnTypes = columnTypes;
    t.columnNames = columnNames;
  });
};

export const row = (cells: Type[], cellNames: string[]) => {
  const rowT = produce(new Type(), (t) => {
    t.rowCellTypes = cells;
    t.rowCellNames = cellNames;
  });

  const errored = rowT.rowCellTypes?.find((t) => t.errorCause != null);

  if (errored != null) {
    return rowT.withErrorCause(getDefined(errored.errorCause));
  } else {
    return rowT;
  }
};

export const column = (
  cellType: Type,
  _columnSize?: number | 'unknown',
  indexedBy?: string | null,
  atParentIndex?: number | null
) => {
  const colT = produce(new Type(), (t) => {
    t.indexedBy = indexedBy ?? null;
    t.cellType = cellType;
    t.columnSize = 'unknown';
    t.atParentIndex = atParentIndex ?? null;
  });

  if (cellType.errorCause != null) {
    return colT.withErrorCause(cellType.errorCause);
  } else {
    return colT;
  }
};

export const functionPlaceholder = (
  name: string,
  argCount: number | undefined
) =>
  produce(new Type(), (fType) => {
    fType.functionness = true;
    fType.functionName = name;
    fType.functionArgCount = argCount;
  });

export const nothing = () =>
  produce(new Type(), (nothingType) => {
    nothingType.nothingness = true;
  });

export const anything = () =>
  produce(new Type(), (anyType) => {
    anyType.anythingness = true;
  });

export const impossible = (
  errorCause: string | InferError,
  inNode: AST.Node | null = null
): Type =>
  produce(new Type(), (impossibleType) => {
    if (typeof errorCause === 'string') {
      errorCause = new InferError(errorCause);
    }

    impossibleType.errorCause = errorCause;
    impossibleType.node = inNode;
  });
