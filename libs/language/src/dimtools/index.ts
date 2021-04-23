import { getDefined } from '../utils';
import { Type } from '../type';
import * as Values from '../interpreter/Value';

const allMatch = <T extends unknown>(
  array: T[],
  matchFn: (a: T, b: T) => boolean
) =>
  array.every((tuple, index) => {
    const nextItem = array[index + 1];

    return nextItem != null ? matchFn(tuple, nextItem) : true;
  });

interface ReduceOptions {
  reduces?: number;
}

const getToReduce = <T extends { cardinality: number }>(
  args: T[],
  reduceOptions?: ReduceOptions
): T[] | null => {
  if (reduceOptions?.reduces != null) {
    if (args.length !== 1) {
      throw new Error(
        'Not implemented: non-unary functions being dimension reducers'
      );
    }

    if (args[0].cardinality === 1) {
      throw new Error('Panic: reducer function being called with a scalar');
    }

    // column of scalars
    if (args[0].cardinality === 2) {
      return args;
    }
  }

  return null;
};

// Takes a function that works on scalar types, and raises dimensions recursively
// until they're scalar and good to be arguments to that function.
// Examples:
// [a, b] calls the function with (a, b)
// [[a], [b]] calls the function with (a, b)
// [[a, b], [c, d]] calls the function with (a, c) and (b, d)
export const reduceTypesThroughDims = (
  types: Type[],
  mapFn: (types: Type[]) => Type,
  reduceOptions?: ReduceOptions
): Type => {
  function recurse(types: Type[]): Type {
    const toReduce = getToReduce(types, reduceOptions);
    if (toReduce != null) {
      return mapFn(toReduce);
    }

    if (types.some((t) => t.tupleTypes != null)) {
      return Type.Impossible.withErrorCause('Unexpected tuple');
    }

    const columns = types.filter((t) => t.cellType != null);

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
  mapFn: (values: Values.Value[]) => Values.Value,
  reduceOptions?: ReduceOptions
): Values.Value => {
  function recurse(values: Values.Value[]): Values.Value {
    const toReduce = getToReduce(values, reduceOptions);
    if (toReduce != null) {
      return mapFn(toReduce);
    }

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
