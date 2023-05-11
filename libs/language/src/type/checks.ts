import { dequal } from 'dequal';
import { PromiseOrType } from '@decipad/utils';
import { PrimitiveTypeName, Type } from '.';
import type { Time } from '..';
import { zip } from '../utils';
import * as t from './buildType';
import { InferError } from './InferError';
import { propagatePercentage } from './percentages';
import { Unit } from './unit-type';
import {
  combineUnits,
  inverseExponent,
  multiplyExponent,
  setUnit,
  timeUnits,
  propagateTypeUnits,
} from './units';

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
    return me.expected(t[type]());
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

export const isTable = checker(async (me: Type) => {
  if (me.columnNames != null && me.columnTypes != null) {
    return me;
  } else {
    return me.expected('table');
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
            async ([myT, otherT]) =>
              (await myT.sameAs(otherT)).errorCause == null
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
      return me.expected(specificity ? t.date(specificity) : 'date');
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

export const multiplyUnit = checker((me: Type, withUnits: Unit[] | null) => {
  return setUnit(me, combineUnits(me.unit, withUnits, { mult: true }));
});

export const divideUnit = checker(
  (me: Type, divideBy: Unit[] | number | null) => {
    if (typeof divideBy === 'number') {
      const multiplyBy = 1 / divideBy;
      if (me.unit) {
        return setUnit(me, multiplyExponent(me.unit, multiplyBy));
      }
      return me;
    } else {
      const invTheirUnits = divideBy?.map((u) => inverseExponent(u)) ?? [];
      const combinedUnits = combineUnits(me.unit, invTheirUnits);
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
    return t.impossible(InferError.expectedPrimitive(me));
  } else {
    return me;
  }
});
