import { getDefined } from '../utils';
import { Type } from '../type';
import * as Values from '../interpreter/Value';

const arrayOfOnes = (length: number) => Array.from({ length }, () => 1);

const allMatch = <T extends unknown>(
  array: T[],
  matchFn: (a: T, b: T) => boolean
) =>
  array.every((tuple, index) => {
    const nextItem = array[index + 1];

    return nextItem != null ? matchFn(tuple, nextItem) : true;
  });

const validateCardinalities = <T extends { cardinality: number }>(
  args: T[],
  expectedCardinalities: number[]
) => args.every((arg, i) => arg.cardinality >= expectedCardinalities[i]);

// Takes a function expects a certain cardinality in each argument,
// and arguments that might have a higher cardinality. Higher cardinality
// arguments are looped over, constructing a result that's higher dimension.
//
// Examples:
// [a, b] calls the function with (a, b)
// [[a], [b]] calls the function with (a, b)
// [[a, b], [c, d]] calls the function with (a, c) and (b, d)
export const automapTypes = (
  types: Type[],
  mapFn: (types: Type[]) => Type,
  expectedCardinalities = arrayOfOnes(types.length)
): Type => {
  function recurse(types: Type[]): Type {
    if (types.some((t) => t.tupleTypes != null)) {
      return Type.Impossible.withErrorCause('Unexpected tuple');
    }

    const toMapOver = types.filter(
      (t, i) => t.cardinality > expectedCardinalities[i]
    );
    const mapLength = toMapOver[0]?.columnSize;

    if (mapLength != null) {
      if (allMatch(toMapOver, (a, b) => a.columnSize === b.columnSize)) {
        // When an argument is higher-dimensional than expected,
        // the result of the call is also higher dimensional.
        // To achieve this we essentially do .map(fargs => recurse(fargs))
        const mappedValues = types.map((t) =>
          toMapOver.includes(t) ? getDefined(t.cellType) : t
        );

        return Type.buildColumn(recurse(mappedValues), mapLength);
      } else {
        return Type.Impossible.withErrorCause('Mismatched column lengths');
      }
    } else {
      return mapFn(types);
    }
  }

  if (validateCardinalities(types, expectedCardinalities)) {
    return recurse(types);
  } else {
    return Type.Impossible.withErrorCause('A column is required');
  }
};

const getRowCount = (v?: Values.Value) =>
  (v as Values.Column | undefined)?.rowCount ?? null;

// Extremely symmetric with the above function
export const automapValues = (
  values: Values.Value[],
  mapFn: (values: Values.Value[]) => Values.Value,
  expectedCardinalities = arrayOfOnes(values.length)
): Values.Value => {
  function recurse(values: Values.Value[]): Values.Value {
    const toMapOver = values.filter(
      (t, i) => t.cardinality > expectedCardinalities[i]
    );
    const mapLength = (toMapOver[0] as Values.Column | undefined)?.rowCount;

    if (mapLength != null) {
      if (allMatch(toMapOver, (a, b) => getRowCount(a) === getRowCount(b))) {
        // When an argument is higher-dimensional than expected,
        // the result of the call is also higher dimensional.
        // To achieve this we essentially do .map(fargs => recurse(fargs))
        const mappedValues = Array.from({ length: mapLength }, (_, i) => {
          const thisRow = values.map((v) =>
            toMapOver.includes(v)
              ? getDefined((v as Values.Column).values?.[i])
              : v
          );

          return recurse(thisRow);
        });

        return Values.Column.fromValues(mappedValues);
      } else {
        throw new Error('panic; mismatched column lengths');
      }
    } else {
      return mapFn(values);
    }
  }

  if (validateCardinalities(values, expectedCardinalities)) {
    return recurse(values);
  } else {
    throw new Error('panic: one or more cardinalities are too low');
  }
};
