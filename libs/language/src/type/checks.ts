import { dequal } from 'dequal';

import type { Time } from '..';
import { equalOrUnknown, getDefined, zip } from '../utils';
import { TypeName, Type } from '.';
import * as t from './build';
import { InferError } from './InferError';
import {
  combineUnits,
  inverseExponent,
  matchUnitArrays,
  multiplyExponent,
  removeSingleUnitless,
  setUnit,
  timeUnits,
} from './units';
import { Units, units } from './unit-type';

const checker = <Args extends unknown[]>(
  fn: (...args: Args) => Type
): typeof fn => {
  return function typeChecker(...args: Args) {
    const errored = args.find(
      (a) => a instanceof Type && a.errorCause != null
    ) as Type | undefined;

    return errored ?? fn(...args);
  };
};

export const isScalar = checker((me: Type, type: TypeName) => {
  if (type === me.type) {
    return me;
  } else {
    return me.expected(t.scalar(type));
  }
});

export const sameUnitsAs = checker((me: Type, other: Type) => {
  if (!matchUnitArrays(me.unit, other.unit)) {
    return me.withErrorCause(InferError.expectedUnit(other.unit, me.unit));
  }
  return me;
});

export const noUnitsOrSameUnitsAs = checker((me: Type, other: Type) => {
  return !me.unit ? me : me.sameUnitsAs(other);
});

export const sameScalarnessAs = checker((me: Type, other: Type) => {
  const meScalar = me.type != null;
  const theyScalar = me.type != null;

  if (meScalar && theyScalar) {
    const matchingTypes = me.type === other.type;
    const matchingUnits = matchUnitArrays(me.unit, other.unit);
    const onlyOneHasAUnit = removeSingleUnitless(me, other);

    if (matchingTypes && matchingUnits) {
      return me;
    } else if (!matchingTypes) {
      return me.expected(other);
    } else if (onlyOneHasAUnit != null) {
      return setUnit(me, onlyOneHasAUnit);
    } else {
      return me.withErrorCause(InferError.expectedUnit(other.unit, me.unit));
    }
  } else if (!meScalar && !theyScalar) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const isColumn = checker((me: Type, size?: number | 'unknown') => {
  if (
    (size === undefined && me.columnSize != null) ||
    me.columnSize === size ||
    me.columnSize === 'unknown' ||
    size === 'unknown'
  ) {
    return me;
  } else {
    return me.withErrorCause(
      `Incompatible column sizes: ${me.columnSize} and ${size ?? 'any'}`
    );
  }
});

export const isTable = checker((me: Type) => {
  if (me.columnNames != null && me.columnTypes != null) {
    return me;
  } else {
    return me.expected('table');
  }
});

export const isTableOrRow = checker((me: Type) => {
  if (
    (me.columnNames != null && me.columnTypes != null) ||
    (me.rowCellTypes != null && me.rowCellNames != null)
  ) {
    return me;
  } else {
    return me.expected('table or row');
  }
});

export const reduced = checker((me: Type) => {
  if (me.cellType != null) {
    return me.cellType;
  } else {
    return me.expected('column');
  }
});

export const reducedOrSelf = checker((me: Type) => {
  if (me.cellType != null) {
    return me.cellType;
  } else {
    return me;
  }
});

export const reducedToLowest = checker((me: Type) => {
  while (me.cellType) {
    me = me.cellType;
  }
  return me;
});

export const withColumnSize = checker(
  (me: Type, columnSize: number | 'unknown' | null) => {
    if (
      me.columnSize === columnSize ||
      me.columnSize === 'unknown' ||
      columnSize === 'unknown'
    ) {
      return me;
    } else {
      return me.withErrorCause(
        `Incompatible column sizes: ${me.columnSize} and ${columnSize}`
      );
    }
  }
);

export const withMinimumColumnCount = (
  me: Type,
  minimumColumnSize: number | 'unknown' | null
) => {
  const columnCount = (me.columnTypes ?? []).length;
  if (
    minimumColumnSize === 'unknown' ||
    minimumColumnSize === null ||
    (minimumColumnSize !== null && columnCount >= minimumColumnSize)
  ) {
    return me;
  } else {
    return me.withErrorCause(
      `Incompatible minimum column count: ${columnCount} and ${minimumColumnSize}`
    );
  }
};

export const withAtParentIndex = checker((me: Type, atParentIndex?: number) => {
  if (
    (atParentIndex == null && me.atParentIndex != null) ||
    (atParentIndex != null && me.atParentIndex === atParentIndex)
  ) {
    return me;
  } else {
    return me.withErrorCause(InferError.expectedColumnContained());
  }
});

export const sameColumnessAs = checker((me: Type, other: Type) => {
  return me.withColumnSize(other.columnSize).mapType((t) => {
    if (t.columnSize) {
      // Recurse to make sure it's a colummn of the same size
      return t
        .reduced()
        .sameAs(other.reduced())
        .mapType(() => t);
    } else {
      return t;
    }
  });
});

export const isRange = checker((me: Type) => {
  if (me.rangeOf != null) {
    return me;
  } else {
    return me.expected('range');
  }
});

export const getRangeOf = checker((me: Type) => {
  return me.rangeOf ?? me.expected('range');
});

export const sameRangenessAs = checker((me: Type, other: Type) => {
  if (me.rangeOf != null && other.rangeOf != null) {
    return me.rangeOf.sameAs(other.rangeOf).mapType(() => me);
  } else if (me.rangeOf == null && other.rangeOf == null) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const sameTablenessAs = checker((me: Type, other: Type) => {
  if (me.columnTypes != null && other.columnTypes != null) {
    if (
      dequal(me.columnNames, other.columnNames) &&
      zip(me.columnTypes, other.columnTypes).every(
        ([myT, otherT]) => myT.sameAs(otherT).errorCause == null
      ) &&
      equalOrUnknown(getDefined(me.tableLength), getDefined(other.tableLength))
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

export const isTimeQuantity = checker((me: Type) => {
  if (
    me.unit == null ||
    me.unit.args.length === 0 ||
    !me.unit.args.every((unit) => timeUnits.has(unit.unit))
  ) {
    return me.expected('time quantity');
  }
  return me;
});

export const isDate = checker((me: Type, specificity?: Time.Specificity) => {
  if (me.date != null && (specificity == null || me.date === specificity)) {
    return me;
  } else {
    return me.expected(specificity ? t.date(specificity) : 'date');
  }
});

export const sameDatenessAs = checker((me: Type, other: Type) => {
  if (me.date === other.date) {
    return me;
  } else {
    return me.expected(other);
  }
});

export const multiplyUnit = checker((me: Type, withUnits: Units | null) => {
  return setUnit(me, combineUnits(me.unit, withUnits, { mult: true }));
});

export const divideUnit = checker(
  (me: Type, divideBy: Units | number | null) => {
    if (typeof divideBy === 'number') {
      const multiplyBy = 1 / divideBy;
      if (me.unit) {
        return setUnit(me, multiplyExponent(me.unit, multiplyBy));
      }
      return me;
    } else {
      const invTheirUnits = divideBy?.args.map((u) => inverseExponent(u)) ?? [];

      return setUnit(me, combineUnits(me.unit, units(...invTheirUnits)));
    }
  }
);

export const sameAs = checker((me: Type, other: Type) => {
  const ensurers = [
    sameScalarnessAs,
    sameColumnessAs,
    sameDatenessAs,
    sameRangenessAs,
    sameTablenessAs,
  ];

  let type = me;
  for (const cmp of ensurers) {
    type = cmp(type, other);
    if (type.errorCause) return type;
  }

  return type;
});
