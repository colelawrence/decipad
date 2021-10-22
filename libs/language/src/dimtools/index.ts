import { allMatch, getDefined, getInstanceof } from '../utils';
import { Type, build as t } from '../type';
import * as Values from '../interpreter/Value';
import { getReductionPlan } from './getReductionPlan';
import {
  arrayOfOnes,
  validateCardinalities,
  IndexNames,
  compareDimensions,
} from './common';

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
  expectedCardinalities = arrayOfOnes(argTypes.length),
  indexNames: IndexNames = argTypes.map((a) => a.indexedBy)
): Type => {
  if (!validateCardinalities(argTypes, expectedCardinalities)) {
    return t.impossible('A column is required');
  }

  function recurse(argTypes: Type[]): Type {
    // When an argument is higher-dimensional than expected,
    // the result of the call is also higher dimensional.
    // To achieve this we essentially do .map(fargs => recurse(fargs))
    const { whichToReduce, firstToReduce } = getReductionPlan(
      argTypes,
      expectedCardinalities,
      indexNames
    );

    if (!firstToReduce) {
      return mapFn(argTypes);
    }

    const argumentsToReduce = argTypes.filter((_arg, i) => whichToReduce[i]);
    if (!allMatch(argumentsToReduce, compareDimensions)) {
      return t.impossible('Mismatched column lengths');
    }

    const reducedArguments = argTypes.map((type, argIndex) => {
      if (whichToReduce[argIndex]) {
        return getDefined(type.cellType);
      } else {
        return type;
      }
    });

    return t.column(
      recurse(reducedArguments),
      getDefined(firstToReduce.columnSize),
      firstToReduce.indexedBy
    );
  }

  return recurse(argTypes);
};

// Extremely symmetrical with the above function
export const automapValues = (
  argValues: Values.Value[],
  mapFn: (values: Values.Value[]) => Values.Value,
  expectedCardinalities = arrayOfOnes(argValues.length),
  indexNames: IndexNames = argValues.map(() => null)
): Values.Value => {
  if (!validateCardinalities(argValues, expectedCardinalities)) {
    throw new Error('panic: one or more cardinalities are too low');
  }

  function recurse(argValues: Values.Value[]): Values.Value {
    // When an argument is higher-dimensional than expected,
    // the result of the call is also higher dimensional.
    // To achieve this we essentially do .map(fargs => recurse(fargs))
    const { whichToReduce, firstToReduce } = getReductionPlan(
      argValues,
      expectedCardinalities,
      indexNames
    );

    if (!firstToReduce) {
      return mapFn(argValues);
    }

    const length = getInstanceof(firstToReduce, Values.Column).rowCount;

    return Values.Column.fromValues(
      Array.from({ length }, (_, rowIndex) => {
        const reducedArguments = argValues.map((arg, argIndex) => {
          if (whichToReduce[argIndex]) {
            return getInstanceof(arg, Values.Column).values[rowIndex];
          } else {
            return arg;
          }
        });

        return recurse(reducedArguments);
      })
    );
  }

  return recurse(argValues);
};
