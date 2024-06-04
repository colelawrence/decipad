// eslint-disable-next-line no-restricted-imports
import { immerable } from 'immer';
import omit from 'lodash.omit';
import type {
  AST,
  IInferError,
  Time,
  Type as TypeInterface,
  Unit as TUnit,
} from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';
import { produce, getDefined, dequal, zip } from '@decipad/utils';
import { N } from '@decipad/number';
import { InferError } from '../InferError';
import type { Specificity } from '../Time/Time';
import { timeUnitFromUnit } from '../Time/timeUnitFromUnit';
import { timeUnits } from '../Time/timeUnits';
import { Unit } from '@decipad/language-units';

export type PrimitiveTypeName = 'number' | 'string' | 'boolean';

type CombineArg = PromiseOrType<Type> | ((t: Type) => PromiseOrType<Type>);

export class Type implements TypeInterface {
  [immerable] = true;

  node: AST.Node | null = null;
  errorCause: IInferError | null = null;

  type: PrimitiveTypeName | null = null;
  unit: TUnit[] | null = null;
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
  functionArgNames: string[] | undefined;
  functionBody: AST.Block | undefined;
  functionScopeDepth: number | undefined;

  tree: Type[] | undefined;

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

  withErrorCause(error: IInferError | string): Type {
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

  async isTree(): Promise<Type> {
    return isTree(this);
  }

  async isFunction(): Promise<Type> {
    return isFunction(this);
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

  async multiplyUnit(withUnits: TUnit[] | null): Promise<Type> {
    return multiplyUnit(this, withUnits);
  }

  async divideUnit(divideBy: TUnit[] | number | null): Promise<Type> {
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
  unit: TUnit[] | null = null,
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

export const timeQuantity = (timeUnit: TUnit | string) =>
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

interface BuildTreeArgs {
  columnTypes: Type[];
  columnNames: string[];
}

export const tree = ({ columnTypes, columnNames }: BuildTreeArgs) => {
  if (!columnTypes) {
    throw new TypeError('columnTypes is required when building tree');
  }
  if (!columnNames) {
    throw new TypeError('columnNames is required when building tree');
  }
  return produce(new Type(), (t) => {
    t.tree = columnTypes;
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
  argNames?: string[],
  functionBody?: AST.Block,
  scopeDepth = 0
) =>
  produce(new Type(), (fType) => {
    fType.functionness = true;
    fType.functionName = name;
    fType.functionArgNames = argNames;
    fType.functionBody = functionBody;
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

const checker = <Args extends unknown[]>(
  fn: (...args: Args) => PromiseOrType<Type>
): typeof fn => {
  return async function typeChecker(...args: Args) {
    const errored = args.find(
      (a) => a instanceof Type && a.errorCause != null
    ) as Type | undefined;

    return errored ?? fn(...args);
  };
};

export const isScalar = checker(async (me: Type, type: PrimitiveTypeName) => {
  if (type === me.type) {
    return me;
  } else {
    return me.expected(primitive(type));
  }
});

export const sameScalarnessAs = checker(async (me: Type, other: Type) => {
  const meScalar = me.type != null;
  const theyScalar = me.type != null;

  if (meScalar && theyScalar) {
    const matchingTypes = me.type === other.type;
    if (!matchingTypes) {
      return me.expected(other);
    }
    if (me.type === 'number') {
      return propagateTypeUnits(me, other);
    }

    return me;
  } else if (!meScalar && !theyScalar) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const sharePercentage = checker((me: Type, other: Type) => {
  if (me.type === 'number' && other.type === 'number') {
    return propagatePercentage(me, other);
  }
  return me;
});

export const isNothing = checker(async (me: Type) => {
  if (me.nothingness === true) {
    return me;
  } else {
    return me.expected('nothing');
  }
});

export const isColumn = checker(async (me: Type) => {
  if (me.cellType != null) {
    return me;
  } else {
    return me.expected('column');
  }
});

export const isFunction = checker(async (me: Type) => {
  if (
    me.functionness != null &&
    me.functionArgNames != null &&
    me.functionBody != null
  ) {
    return me;
  } else {
    return me.expected('function');
  }
});

export const isTable = checker(async (me: Type) => {
  if (me.columnNames != null && me.columnTypes != null && me.tree == null) {
    return me;
  } else {
    return me.expected('table');
  }
});

export const isTree = checker(async (me: Type) => {
  if (me.tree != null) {
    return me;
  } else {
    return me.expected('tree');
  }
});

export const isTableOrRow = checker(async (me: Type) => {
  if (
    (me.columnNames != null && me.columnTypes != null) ||
    (me.rowCellTypes != null && me.rowCellNames != null)
  ) {
    return me;
  } else {
    return me.expected('table or row');
  }
});

export const reduced = checker(async (me: Type) => {
  if (me.cellType != null) {
    return me.cellType;
  } else {
    return me.expected('column');
  }
});

export const reducedToLowest = checker((me: Type) => {
  while (me.cellType) {
    me = me.cellType;
  }
  return me;
});

export const withMinimumColumnCount = checker(
  (me: Type, minColumns: number) => {
    const columnCount = (me.columnTypes ?? []).length;
    if (columnCount >= minColumns) {
      return me;
    } else {
      return me.withErrorCause(
        `Expected table with at least ${minColumns} column${
          minColumns === 1 ? '' : 's'
        }`
      );
    }
  }
);

export const withAtParentIndex = checker((me: Type) => {
  if (me.atParentIndex != null) {
    return me;
  } else {
    return me.withErrorCause(
      InferError.expectedTableAndAssociatedColumn(null, me)
    );
  }
});

export const sameColumnessAs = checker(async (me: Type, other: Type) => {
  if (me.cellType != null && other.cellType != null) {
    return (await me.cellType.sameAs(other.cellType)).mapType(() => me);
  } else if (me.cellType == null && other.cellType == null) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const isRange = checker(async (me: Type) => {
  if (me.rangeOf != null) {
    return me;
  } else {
    return me.expected('range');
  }
});

export const getRangeOf = checker(
  async (me: Type) => me.rangeOf ?? me.expected('range')
);

export const sameRangenessAs = checker(async (me: Type, other: Type) => {
  if (me.rangeOf != null && other.rangeOf != null) {
    return (await me.rangeOf.sameAs(other.rangeOf)).mapType(() => me);
  } else if (me.rangeOf == null && other.rangeOf == null) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const sameTablenessAs = checker(async (me: Type, other: Type) => {
  if (me.columnTypes != null && other.columnTypes != null) {
    if (
      dequal(me.columnNames, other.columnNames) &&
      (
        await Promise.all(
          zip(me.columnTypes, other.columnTypes).map(
            async ([myT, otherT]) => !isErrorType(await myT.sameAs(otherT))
          )
        )
      ).every(Boolean)
    ) {
      return me;
    } else {
      return me.expected(other);
    }
  } else if (me.columnTypes == null && other.columnTypes == null) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const isTimeQuantity = checker(async (me: Type) => {
  if (
    me.unit == null ||
    me.unit.length === 0 ||
    !me.unit.every((unit) => timeUnits.has(unit.unit))
  ) {
    return me.expected('time quantity');
  }
  return me;
});

export const isDate = checker(
  async (me: Type, specificity?: Time.Specificity) => {
    if (me.date != null && (specificity == null || me.date === specificity)) {
      return me;
    } else {
      return me.expected(specificity ? date(specificity) : 'date');
    }
  }
);

export const sameDatenessAs = checker(async (me: Type, other: Type) => {
  if (
    me.date === 'undefined' ||
    other.date === 'undefined' ||
    me.date === other.date
  ) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const multiplyUnit = checker((me: Type, withUnits: TUnit[] | null) => {
  return setUnit(me, Unit.combineUnits(me.unit, withUnits, { mult: true }));
});

export const divideUnit = checker(
  (me: Type, divideBy: TUnit[] | number | null) => {
    if (typeof divideBy === 'number') {
      const multiplyBy = 1 / divideBy;
      if (me.unit) {
        return setUnit(me, Unit.multiplyExponent(me.unit, multiplyBy));
      }
      return me;
    } else {
      const invTheirUnits = divideBy?.map((u) => Unit.inverseExponent(u)) ?? [];
      const combinedUnits = Unit.combineUnits(me.unit, invTheirUnits);
      return setUnit(me, combinedUnits);
    }
  }
);

export const sameAs = checker(
  async (me: PromiseOrType<Type>, _other: PromiseOrType<Type>) => {
    const ensurers = [
      sameScalarnessAs,
      sameColumnessAs,
      sameDatenessAs,
      sameRangenessAs,
      sameTablenessAs,
    ];

    const other = await _other;
    let type = await me;
    for (const cmp of ensurers) {
      // eslint-disable-next-line no-await-in-loop
      type = await cmp(type, other);
      if (type.errorCause) return type;
    }

    return type;
  }
);

export const isPrimitive = checker(async (me: Type) => {
  const anyOf = await Type.either(
    me.isDate(),
    me.isScalar('string'),
    me.isScalar('number'),
    me.isScalar('boolean')
  );

  if (anyOf.errorCause) {
    return impossible(InferError.expectedPrimitive(me));
  } else {
    return me;
  }
});

// Boolean checks
export const isDateType = (t: Type): t is Type & { date: Time.Specificity } => {
  return t.date != null;
};

export const isErrorType = (
  t: Type
): t is Type & { errorCause: InferError } => {
  return t.errorCause != null;
};

export const isFunctionType = (t: Type): t is Type & { functionness: true } => {
  return t.functionness;
};

export const isPendingType = (t: Type): t is Type & { pending: true } => {
  return t.pending;
};

export const isNumberType = (t: Type): t is Type & { type: 'number' } => {
  return t.type === 'number';
};

export const onlyOneIsPercentage = (
  me: AST.NumberFormat | null,
  other: AST.NumberFormat | null
) => {
  if (me === 'percentage' && other === 'percentage') {
    return false;
  }
  if (me === 'percentage' || other === 'percentage') {
    return true;
  }
  return false;
};

export const propagatePercentage = (me: Type, other: Type) => {
  if (onlyOneIsPercentage(me.numberFormat, other.numberFormat)) {
    return produce(me, (m) => {
      m.numberFormat = null;
    });
  }
  return me;
};

export const removeSingleUnitless = (a: Type, b: Type) => {
  const bothNumbers = a.type === 'number' && b.type === 'number';
  const oneIsUnitless = (a.unit == null) !== (b.unit == null);

  if (bothNumbers && oneIsUnitless) {
    return getDefined(a.unit ?? b.unit);
  } else {
    return null;
  }
};

export const propagateTypeUnits = (me: Type, other: Type) => {
  me = propagatePercentage(me, other);

  me = produce(me, (me) => {
    me.numberError ??= other.numberError;
  });

  const matchingUnits = Unit.matchUnitArrays(me.unit, other.unit);
  if (matchingUnits) {
    return me;
  }

  const onlyOneHasAUnit = removeSingleUnitless(me, other);
  if (onlyOneHasAUnit) {
    return setUnit(me, onlyOneHasAUnit);
  }

  return me.withErrorCause(InferError.expectedUnit(other.unit, me.unit));
};

export const setUnit = (t: Type, newUnit: TUnit[] | null) =>
  produce(t, (t) => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
