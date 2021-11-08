import { allMatch, zip } from '../utils';
import { Type, build as t } from '../type';
import * as Value from '../interpreter/Value';
import { getReductionPlan } from './getReductionPlan';
import {
  arrayOfOnes,
  compareDimensions,
  deLinearizeType,
  linearizeType,
  validateCardinalities,
} from './common';
import { Hypercube } from './hypercube';
import {
  DimensionalValue,
  groupTypesByDimension,
  hypercubeLikeToValue,
} from './multidimensional-utils';

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
  if (!validateCardinalities(argTypes, expectedCardinalities)) {
    return t.impossible('A column is required');
  }

  if (expectedCardinalities.every((c) => c === 1)) {
    // Expand dimensions by returning the union of all arguments' dims
    const linearTypedArgs = argTypes.map((t) => linearizeType(t));
    const scalarArgs = linearTypedArgs.map((types) => types[types.length - 1]);
    const allDimensions = groupTypesByDimension(
      ...linearTypedArgs.map((item) => item.slice(0, -1))
    );

    if (!allDimensions.every((types) => allMatch(types, compareDimensions))) {
      return t.impossible('Mismatched dimensions');
    }

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
      throw new Error('Selective reduction is not supported yet');
    }
  }
};

// Extremely symmetrical with the above function
export const automapValues = (
  argTypes: Type[],
  argValues: Value.Value[],
  mapFn: (values: Value.Value[]) => Value.Value,
  expectedCardinalities = arrayOfOnes(argValues.length)
): Value.Value => {
  if (!validateCardinalities(argTypes, expectedCardinalities)) {
    throw new Error('panic: one or more cardinalities are too low');
  }

  const dimensionalArgs = zip(argTypes, argValues).map(([type, value]) =>
    DimensionalValue.fromValue(value, type)
  );

  if (expectedCardinalities.every((c) => c === 1)) {
    return hypercubeLikeToValue(new Hypercube(mapFn, ...dimensionalArgs));
  } else {
    const whichToReduce = getReductionPlan(argTypes, expectedCardinalities);

    if (whichToReduce.every((doReduce) => doReduce === false)) {
      // Reduce nothing -- input dimensions are correct
      return mapFn(dimensionalArgs.map(hypercubeLikeToValue));
    } else {
      throw new Error('Selective reduction is not supported yet');
    }
  }
};
