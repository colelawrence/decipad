import produce from 'immer';
import Fraction from '@decipad/fraction';
import { AST, Time } from '..';
import { InferError, Type, PrimitiveTypeName } from '.';
import { getDefined } from '../utils';
import { Unit, Units, units } from './unit-type';
import { timeUnitFromUnit } from '../date';

// "scalar" is a legacy name
export const scalar = (type: PrimitiveTypeName) =>
  produce(new Type(), (t) => {
    t.type = type;
  });

export const number = (unit: Units | Unit[] | null = null) =>
  produce(scalar('number'), (t) => {
    t.unit = Array.isArray(unit) ? units(...unit) : unit;
  });

export const string = () => scalar('string');

export const boolean = () => scalar('boolean');

export const range = (rangeContents: Type) =>
  produce(new Type(), (t) => {
    t.rangeOf = rangeContents;
  });

export const date = (specificity: Time.Specificity) =>
  produce(new Type(), (t) => {
    t.date = specificity;
  });

export const timeQuantity = (timeUnits: (Unit | string)[]) =>
  produce(scalar('number'), (numberType) => {
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

export const table = ({
  indexName,
  length,
  columnTypes,
  columnNames,
}: BuildTableArgs) => {
  const t = new Type();

  t.indexName = indexName ?? null;
  t.tableLength = length;
  t.columnTypes = columnTypes;
  t.columnNames = columnNames;

  const errored = t.columnTypes.find((t) => t.errorCause != null);
  if (errored != null) {
    return t.withErrorCause(getDefined(errored.errorCause));
  } else {
    return t;
  }
};

export const row = (cells: Type[], cellNames: string[]) => {
  const t = new Type();

  t.rowCellTypes = cells;
  t.rowCellNames = cellNames;

  const errored = t.rowCellTypes.find((t) => t.errorCause != null);

  if (errored != null) {
    return t.withErrorCause(getDefined(errored.errorCause));
  } else {
    return t;
  }
};

export const column = (
  cellType: Type,
  columnSize: number | 'unknown',
  indexedBy?: string | null,
  atParentIndex?: number | null
) => {
  const t = new Type();

  t.indexedBy = indexedBy ?? null;
  t.cellType = cellType;
  t.columnSize = columnSize;
  t.atParentIndex = atParentIndex ?? null;

  if (cellType.errorCause != null) {
    return t.withErrorCause(cellType.errorCause);
  } else {
    return t;
  }
};

export const functionPlaceholder = () =>
  produce(new Type(), (fType) => {
    fType.functionness = true;
  });

export const nothing = () =>
  produce(new Type(), (fType) => {
    fType.nothingness = true;
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
