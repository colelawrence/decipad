import produce from 'immer';
import { AST, Time } from '..';
import { InferError, Type, TypeName } from '.';
import { getDefined } from '../utils';

// "scalar" is a legacy name
export const scalar = (type: TypeName) =>
  produce(new Type(), (t) => {
    t.type = type;
  });

export const number = (unit: AST.Unit[] | null = null) =>
  produce(scalar('number'), (t) => {
    t.unit = unit;
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

export const timeQuantity = (timeUnits: Time.Unit[]) =>
  produce(new Type(), (t) => {
    t.timeUnits = timeUnits;
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
  indexedBy?: string | null
) => {
  const t = new Type();

  t.indexedBy = indexedBy ?? null;
  t.cellType = cellType;
  t.columnSize = columnSize;

  if (cellType.errorCause != null) {
    return t.withErrorCause(cellType.errorCause);
  } else {
    return t;
  }
};

export const importedData = (url: string, indexName?: string | null) =>
  produce(new Type(), (t) => {
    t.dataUrl = url;
    t.indexName = indexName ?? null;
  });

export const functionPlaceholder = () =>
  produce(new Type(), (fType) => {
    fType.functionness = true;
  });

export const impossible = (errorCause: string | InferError) => {
  const type = produce(number(), (impossibleType) => {
    impossibleType.type = null;
  });
  if (errorCause != null) {
    return type.withErrorCause(errorCause);
  } else {
    return type;
  }
};
