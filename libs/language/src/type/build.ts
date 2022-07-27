import produce from 'immer';
import Fraction from '@decipad/fraction';
import { AST, Time } from '..';
import { InferError, Type, PrimitiveTypeName } from '.';
import { getDefined } from '../utils';
import { Unit, Units, units } from './unit-type';
import { timeUnitFromUnit } from '../date';

const primitive = (type: PrimitiveTypeName) =>
  produce(new Type(), (t) => {
    t.type = type;
  });

export const number = (
  unit: Units | Unit[] | null = null,
  numberFormat: AST.NumberFormat | null = undefined
) =>
  produce(primitive('number'), (t) => {
    if (unit != null && numberFormat != null) {
      throw new Error('Cannot specify both unit and numberFormat');
    }
    t.unit = Array.isArray(unit) ? units(...unit) : unit;
    t.numberFormat = numberFormat ?? null;
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

export const timeQuantity = (timeUnits: (Unit | string)[]) =>
  produce(primitive('number'), (numberType) => {
    numberType.unit = {
      type: 'units',
      args: timeUnits.map((unit) => ({
        unit: timeUnitFromUnit(unit),
        exp: new Fraction(1),
        multiplier: new Fraction(1),
        known: true,
      })),
    };
  });

interface BuildTableArgs {
  indexName?: string | null;
  length: number | 'unknown';
  columnTypes: Type[];
  columnNames: string[];
}

// TODO: use produce
export const table = ({
  indexName,
  length,
  columnTypes,
  columnNames,
}: BuildTableArgs) => {
  const tableT = produce(new Type(), (t) => {
    t.indexName = indexName ?? null;
    t.tableLength = length;
    t.columnTypes = columnTypes;
    t.columnNames = columnNames;
  });

  const errored = tableT.columnTypes?.find((t) => t.errorCause != null);
  if (errored != null) {
    return tableT.withErrorCause(getDefined(errored.errorCause));
  } else {
    return tableT;
  }
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
  columnSize?: number | 'unknown',
  indexedBy?: string | null,
  atParentIndex?: number | null
) => {
  const colT = produce(new Type(), (t) => {
    t.indexedBy = indexedBy ?? null;
    t.cellType = cellType;
    t.columnSize = columnSize ?? 'unknown';
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
  produce(new Type(), (fType) => {
    fType.nothingness = true;
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
