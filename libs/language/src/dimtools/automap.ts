import * as Value from '../value';
import { createLazyOperation } from '../lazy';
import { build as t, Type } from '../type';
import {
  arrayOfOnes,
  deLinearizeType,
  getCardinality,
  linearizeType,
  findInvalidCardinality,
} from './common';
import { getReductionPlan } from './getReductionPlan';
import { groupTypesByDimension } from './multidimensional-utils';

/**
 * Takes a function expects a certain cardinality in each argument,
 * and arguments that might have a higher cardinality. Higher cardinality
 * arguments are looped over, constructing a result that's higher dimension.
 *
 * Examples:
 * [a, b] calls the function with (a, b)
 * [[a], [b]] calls the function with (a, b)
 * [[a, b], [c, d]] calls the function with (a, c) and (b, d)
 * */
export const automapTypes = (
  argTypes: Type[],
  mapFn: (types: Type[]) => Type,
  expectedCardinalities = arrayOfOnes(argTypes.length)
): Type => {
  const invalidCardinality = findInvalidCardinality(
    argTypes,
    expectedCardinalities
  );

  if (invalidCardinality) {
    return invalidCardinality.expected(t.column(t.anything()));
  }

  if (expectedCardinalities.every((c) => c === 1)) {
    // Expand dimensions by returning the union of all arguments' dims
    const linearTypedArgs = argTypes.map((t) => linearizeType(t));
    const scalarArgs = linearTypedArgs.map((types) => types[types.length - 1]);
    const allDimensions = groupTypesByDimension(
      ...linearTypedArgs.map((item) => item.slice(0, -1))
    );

    return deLinearizeType([
      ...allDimensions.map((t) => t[0]),
      mapFn(scalarArgs),
    ]);
  } else {
    const whichToReduce = getReductionPlan(argTypes, expectedCardinalities);

    if (whichToReduce.every((w) => w === false)) {
      // Reduce nothing -- input dimensions are correct
      return mapFn(argTypes);
    } else {
      return t.impossible(
        'Operating upon multiple dimensional values is not supported yet'
      );
    }
  }
};

// Extremely symmetrical with the above function
export const automapValues = (
  argTypes: Type[],
  argValues: Value.Value[],
  mapFn: (values: Value.Value[], types: Type[]) => Value.Value,
  expectedCardinalities = arrayOfOnes(argValues.length)
): Value.Value => {
  if (findInvalidCardinality(argTypes, expectedCardinalities)) {
    throw new Error('panic: one or more cardinalities are too low');
  }

  if (expectedCardinalities.every((c) => c === 1)) {
    const reducedArgTypes = hackilyReduceArgTypes(
      argTypes,
      expectedCardinalities
    );
    const mapFnAndTypes = (values: Value.Value[]) =>
      mapFn(values, reducedArgTypes);

    return createLazyOperation(mapFnAndTypes, argValues, argTypes);
  } else {
    const whichToReduce = getReductionPlan(argTypes, expectedCardinalities);

    if (whichToReduce.every((doReduce) => doReduce === false)) {
      // Reduce nothing -- input dimensions are correct
      return mapFn(argValues, argTypes);
    } else {
      throw new Error(
        'panic: Operating upon multiple dimensional values is not supported yet'
      );
    }
  }
};

// Minor hack: use the automaptypes function to retrieve the arg types
// Better solution: Make Hypercube type-aware and pass the types from there.
const hackilyReduceArgTypes = (
  argTypes: Type[],
  expectedCardinalities: number[]
) => {
  let argTypesLowerDims: Type[] = [];
  automapTypes(
    argTypes,
    (argTypesFromMapTypes) => {
      argTypesLowerDims = argTypesFromMapTypes;

      // Just satisfying mapFn protocol, nothing to see here
      return t.nothing();
    },
    expectedCardinalities
  );

  return argTypesLowerDims;
};

export const automapTypesForReducer = (
  argType: Type,
  mapFn: (types: Type[]) => Type
): Type => {
  const invalidCardinality = findInvalidCardinality([argType], [2]);
  if (invalidCardinality) {
    return invalidCardinality.expected(t.column(t.anything()));
  }

  if (getCardinality(argType) === 2) {
    return mapFn([argType]);
  } else if (argType.columnSize != null) {
    return t.column(
      automapTypesForReducer(argType.reduced(), mapFn),
      argType.columnSize,
      argType.indexedBy
    );
  } else {
    throw new Error('panic: unreachable');
  }
};

export const automapValuesForReducer = (
  argType: Type,
  argValue: Value.Value,
  mapFn: (values: Value.Value[], types: Type[]) => Value.Value
): Value.Value => {
  if (findInvalidCardinality([argType], [2])) {
    throw new Error('panic: cardinality is too low');
  }

  if (getCardinality(argType) === 2) {
    return mapFn([argValue], [argType]);
  } else {
    const argCol = Value.getColumnLike(
      argValue,
      'reducers always take columnar arguments'
    );
    return Value.Column.fromValues(
      argCol.values.map((v) =>
        automapValuesForReducer(
          argType.reduced(),
          Value.getColumnLike(v),
          mapFn
        )
      ),
      argCol.dimensions.slice(1)
    );
  }
};
