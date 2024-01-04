// eslint-disable-next-line no-restricted-imports
import { immerable } from 'immer';
import omit from 'lodash.omit';
import { PromiseOrType, produce, getDefined } from '@decipad/utils';
import type { Unit } from '@decipad/language-units';
import type { AST, Time } from '..';
import {
  divideUnit,
  getRangeOf,
  isColumn,
  isDate,
  isNothing,
  isPrimitive,
  isRange,
  isScalar,
  isTable,
  isTableOrRow,
  isTimeQuantity,
  multiplyUnit,
  reduced,
  reducedToLowest,
  sameAs,
  sharePercentage,
  withAtParentIndex,
  withMinimumColumnCount,
} from './checks';
import { InferError } from '../InferError';
import { Specificity } from '../Time/Time';
import { N } from '@decipad/number';
import { timeUnitFromUnit } from '../Time/timeUnitFromUnit';

export type PrimitiveTypeName = 'number' | 'string' | 'boolean';

type CombineArg = PromiseOrType<Type> | ((t: Type) => PromiseOrType<Type>);

export class Type {
  [immerable] = true;

  node: AST.Node | null = null;
  errorCause: InferError | null = null;

  type: PrimitiveTypeName | null = null;
  unit: Unit.Unit[] | null = null;
  numberFormat: AST.NumberFormat | null = null;
  numberError: 'month-day-conversion' | null = null;

  date: Time.Specificity | null = null;

  rangeOf: Type | null = null;

  // Indices (columns, tables, imported tables)
  indexName: string | null = null;
  indexedBy: string | null = null;

  // Column
  cellType: Type | null = null;
  atParentIndex: number | null = null;

  // Table
  columnTypes: Type[] | null = null;
  columnNames: string[] | null = null;
  rowCount?: number;
  delegatesIndexTo?: string | null;

  rowIndexName: string | null = null;
  rowCellTypes: Type[] | null = null;
  rowCellNames: string[] | null = null;

  // Functions are impossible types with functionness = true
  functionness = false;
  functionName: string | undefined;
  functionArgCount: number | undefined;
  functionScopeDepth: number | undefined;

  // Set to true when the type is still pending inference
  pending = false;

  // Set to true when no data will be present. Used for empty blocks
  nothingness = false;

  // Set to true when it can be anything. Used for narrowing when you don't care about the insides of composite types
  anythingness = false;

  // Associates the type to a symbol
  symbol: string | null = null;

  // Return the first type that has an error or is pending, or the last one.
  static async combine(
    initialType: Type | Promise<Type>,
    ...types: CombineArg[]
  ): Promise<Type> {
    let lastNonErrorType = await initialType;
    if (lastNonErrorType.errorCause != null || lastNonErrorType.pending) {
      return lastNonErrorType;
    }
    for await (const type of types) {
      const resultingType =
        typeof type === 'function'
          ? await lastNonErrorType.mapType(type)
          : type;
      if (resultingType.errorCause != null || resultingType.pending) {
        return resultingType;
      }
      lastNonErrorType = resultingType;
    }

    return lastNonErrorType;
  }

  /** Return the first non-error type */
  static async either(...types: Array<PromiseOrType<Type>>): Promise<Type> {
    const notErrored = (await Promise.all(types)).find((t) => !t.errorCause);
    return notErrored ?? types[0];
  }

  async mapType(fn: (t: Type) => PromiseOrType<Type>): Promise<Type> {
    if (this.errorCause) {
      return this;
    } else {
      return fn(this);
    }
  }

  inNode(node: AST.Node) {
    return produce(this, (newType) => {
      // IMPORTANT!: prevent circular structures
      const sanitizedNode = omit(node, 'inferredType');
      newType.node = sanitizedNode as AST.Node;
    });
  }

  withErrorCause(error: InferError | string): Type {
    const { node, errorCause } = this;

    if (errorCause) {
      return this;
    } else {
      return produce(new Type(), (impossibleType) => {
        if (typeof error === 'string') {
          error = new InferError(error);
        }
        const sanitized = node && omit(node, 'inferredType');
        impossibleType.node = sanitized as AST.Node;

        impossibleType.errorCause = error;
      });
    }
  }

  async expected(expected: Type | string): Promise<Type> {
    return this.mapType(() =>
      this.withErrorCause(InferError.expectedButGot(expected, this))
    );
  }

  // Type assertions -- these return a new type possibly with an error
  async sameAs(other: Type | Promise<Type>): Promise<Type> {
    return sameAs(this, other);
  }

  async isNothing(): Promise<Type> {
    return isNothing(this);
  }

  async isScalar(type: PrimitiveTypeName): Promise<Type> {
    return isScalar(this, type);
  }

  async isColumn(): Promise<Type> {
    return isColumn(this);
  }

  async isTable(): Promise<Type> {
    return isTable(this);
  }

  async isTableOrRow(): Promise<Type> {
    return isTableOrRow(this);
  }

  async reduced(): Promise<Type> {
    return reduced(this);
  }

  async reducedToLowest(): Promise<Type> {
    return reducedToLowest(this);
  }

  async withAtParentIndex(): Promise<Type> {
    return withAtParentIndex(this);
  }

  async withMinimumColumnCount(colCount = 1): Promise<Type> {
    return withMinimumColumnCount(this, colCount);
  }

  async isPrimitive(): Promise<Type> {
    return isPrimitive(this);
  }

  async isRange(): Promise<Type> {
    return isRange(this);
  }

  async getRangeOf(): Promise<Type> {
    return getRangeOf(this);
  }

  async isTimeQuantity(): Promise<Type> {
    return isTimeQuantity(this);
  }

  async isDate(specificity?: Time.Specificity): Promise<Type> {
    return isDate(this, specificity);
  }

  async multiplyUnit(withUnits: Unit.Unit[] | null): Promise<Type> {
    return multiplyUnit(this, withUnits);
  }

  async divideUnit(divideBy: Unit.Unit[] | number | null): Promise<Type> {
    return divideUnit(this, divideBy);
  }

  async sharePercentage(other: Type): Promise<Type> {
    return sharePercentage(this, other);
  }
}

const primitive = (type: PrimitiveTypeName) =>
  produce(new Type(), (t) => {
    t.type = type;
  });

export const number = (
  unit: Unit.Unit[] | null = null,
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

export const timeQuantity = (timeUnit: Unit.Unit | string) =>
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

export const symbol = (symbol: string) =>
  produce(new Type(), (t) => {
    t.anythingness = true;
    t.symbol = symbol;
  });

interface BuildTableArgs {
  indexName?: string | null;
  delegatesIndexTo?: string | null;
  columnTypes: Type[];
  columnNames: string[];
}

export const table = ({
  indexName,
  columnTypes,
  columnNames,
  delegatesIndexTo,
}: BuildTableArgs) => {
  return produce(new Type(), (t) => {
    t.indexName = indexName ?? null;
    t.delegatesIndexTo = delegatesIndexTo;
    t.columnTypes = columnTypes;
    t.columnNames = columnNames;
  });
};

export const row = (
  cells: Type[],
  cellNames: string[],
  rowIndexName: string | null = null
) => {
  const rowT = produce(new Type(), (t) => {
    t.rowCellTypes = cells;
    t.rowCellNames = cellNames;
    t.rowIndexName = rowIndexName;
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
  indexedBy?: string | null,
  atParentIndex?: number | null
) => {
  const colT = produce(new Type(), (t) => {
    t.indexedBy = indexedBy ?? null;
    t.cellType = cellType;
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
  argCount: number | undefined,
  scopeDepth = 0
) =>
  produce(new Type(), (fType) => {
    fType.functionness = true;
    fType.functionName = name;
    fType.functionArgCount = argCount;
    fType.functionScopeDepth = scopeDepth;
  });

export const nothing = () =>
  produce(new Type(), (nothingType) => {
    nothingType.nothingness = true;
  });

export const pending = () =>
  produce(new Type(), (pendingType) => {
    pendingType.pending = true;
  });

export const anything = () =>
  produce(new Type(), (anyType) => {
    anyType.anythingness = true;
  });

export const date = (specificity: Specificity) =>
  produce(new Type(), (t) => {
    t.date = specificity;
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
    // IMPORTANT!: prevent circular structures
    const sanitized = inNode && omit(inNode, 'inferredType');
    impossibleType.node = sanitized as AST.Node;
  });
