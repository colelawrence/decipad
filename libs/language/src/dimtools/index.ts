import { dequal } from 'dequal';

import { getDefined } from '../utils';
import { Type } from '../type';
import * as Values from '../interpreter/Value';

const tuplesMatch = (tupleA: Type, tupleB: Type) => {
  const typesA = getDefined(tupleA.tupleTypes);
  const typesB = getDefined(tupleB.tupleTypes);

  return (
    dequal(tupleA.tupleNames, tupleB.tupleNames) &&
    typesA.length === typesB.length
  );
};

const allMatch = <T extends unknown>(
  array: T[],
  matchFn: (a: T, b: T) => boolean
) =>
  array.every((tuple, index) => {
    const nextItem = array[index + 1];

    return nextItem != null ? matchFn(tuple, nextItem) : true;
  });

// Takes a function that works on scalar types, and raises dimensions recursively
// until they're scalar and good to be arguments to that function.
// Examples:
// [a, b] calls the function with (a, b)
// [[a], [b]] calls the function with (a, b)
// [[a, b], [c, d]] calls the function with (a, c) and (b, d)
export const reduceTypesThroughDims = (
  types: Type[],
  mapFn: (types: Type[]) => Type
): Type => {
  function recurse(types: Type[]): Type {
    const columns = types.filter((t) => t.cellType != null);
    const tuples = types.filter((t) => t.tupleTypes != null);

    if (tuples.length > 0) {
      if (tuples.length !== types.length || !allMatch(types, tuplesMatch)) {
        return Type.Impossible.withErrorCause('Mismatched tuples');
      } else {
        const tupleLength = getDefined(tuples[0].tupleTypes?.length);
        const tupleNames = tuples[0].tupleNames;
        const tupleTypes = [];

        for (let i = 0; i < tupleLength; i++) {
          const ithTupleTypes = tuples.map((t) =>
            getDefined(t.tupleTypes?.[i])
          );

          tupleTypes.push(recurse(ithTupleTypes));
        }

        return Type.buildTuple(tupleTypes, tupleNames);
      }
    }

    if (columns.length > 0) {
      const colSize = getDefined(columns[0]?.columnSize);

      if (allMatch(columns, (a, b) => a.columnSize === b.columnSize)) {
        // Bring columns down to singles so we can call mapFn
        const asSingles = types.map((t) => t.cellType ?? t);

        return Type.buildColumn(recurse(asSingles), colSize);
      } else {
        return Type.Impossible.withErrorCause('Mismatched column lengths');
      }
    }

    if (types.every((t) => t.cardinality === 1)) {
      return mapFn(types);
    }

    throw new Error('unreachable');
  }

  return recurse(types);
};

// Extremely symmetric with the above function
export const reduceValuesThroughDims = (
  values: Values.Value[],
  mapFn: (values: Values.Value[]) => Values.Value
): Values.Value => {
  function recurse(values: Values.Value[]): Values.Value {
    const columns = values.filter((t) => t.cardinality > 1);

    if (columns.length > 0) {
      const colSize = getDefined(columns[0].rowCount);

      if (allMatch(columns, (a, b) => a.rowCount === b.rowCount)) {
        // Bring columns down to singles so we can call mapFn
        const asColumns = values.map((v) => v.withRowCount(colSize));
        const columnValues = [];

        for (let i = 0; i < colSize; i++) {
          const thisRow = asColumns.map((c) => getDefined(c.values?.[i]));

          columnValues.push(recurse(thisRow));
        }

        return Values.Column.fromValues(columnValues);
      } else {
        throw new Error('panic');
      }
    } else {
      return mapFn(values);
    }
  }

  return recurse(values);
};
