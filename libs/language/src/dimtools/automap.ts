import { map } from '@decipad/generator-utils';
import { PromiseOrType } from '@decipad/utils';
import * as Value from '../value';
import { createLazyOperation } from '../lazy';
import { buildType as t, Type, typeIsPending } from '../type';
import {
  arrayOfOnes,
  deLinearizeType,
  getCardinality,
  linearizeType,
  findInvalidCardinality,
} from './common';
import { getReductionPlan } from './getReductionPlan';
import { groupTypesByDimension } from './multidimensional-utils';

// Minor hack: use the automaptypes function to retrieve the arg types
// Better solution: Make Hypercube type-aware and pass the types from there.
const hackilyReduceArgTypes = async (
  argTypes: Type[],
  expectedCardinalities: number[]
) => {
  let argTypesLowerDims: Type[] = [];
  await automapTypes(
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
export const automapTypes = async (
  argTypes: Type[],
  mapFn: (types: Type[]) => Type | Promise<Type>,
  expectedCardinalities = arrayOfOnes(argTypes.length)
): Promise<Type> => {
  // pending is contagious
  {
    const pending = argTypes.find(typeIsPending);
    if (pending) {
      return pending;
    }
  }
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

    // pending is contagious
    {
      const pending = scalarArgs.find(typeIsPending);
      if (pending) {
        return pending;
      }
    }

    const allDimensions = groupTypesByDimension(
      ...linearTypedArgs.map((item) => item.slice(0, -1))
    );

    return deLinearizeType([
      ...allDimensions.map((t) => t[0]),
      await mapFn(scalarArgs),
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
export const automapValues = async (
  argTypes: Type[],
  argValues: Value.Value[],
  mapFn: (values: Value.Value[], types: Type[]) => PromiseOrType<Value.Value>,
  expectedCardinalities = arrayOfOnes(argValues.length)
): Promise<Value.Value> => {
  if (findInvalidCardinality(argTypes, expectedCardinalities)) {
    throw new Error('panic: one or more cardinalities are too low');
  }

  if (expectedCardinalities.every((c) => c === 1)) {
    const reducedArgTypes = await hackilyReduceArgTypes(
      argTypes,
      expectedCardinalities
    );
    const mapFnAndTypes = async (values: Value.Value[]) =>
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

export const automapTypesForReducer = async (
  argType: Type,
  mapFn: (types: Type[]) => Type | Promise<Type>
): Promise<Type> => {
  const invalidCardinality = findInvalidCardinality([argType], [2]);
  if (invalidCardinality) {
    return invalidCardinality.expected(t.column(t.anything()));
  }

  if (getCardinality(argType) === 2) {
    return mapFn([argType]);
  } else if (argType.cellType != null) {
    return t.column(
      await automapTypesForReducer(argType.cellType, mapFn),
      argType.indexedBy
    );
  } else {
    throw new Error('panic: unreachable');
  }
};

export const automapValuesForReducer = async (
  argType: Type,
  argValue: Value.Value,
  mapFn: (values: Value.Value[], types: Type[]) => PromiseOrType<Value.Value>
): Promise<Value.Value> => {
  if (findInvalidCardinality([argType], [2])) {
    throw new Error('panic: cardinality is too low');
  }

  const cardinality = getCardinality(argType);
  if (cardinality === 2) {
    return mapFn([argValue], [argType]);
  } else {
    const argCol = Value.getColumnLike(
      argValue,
      'reducers always take columnar arguments'
    );
    return Value.Column.fromGenerator((start?: number, end?: number) => {
      return map(argCol.values(start, end), async (v) => {
        return automapValuesForReducer(
          await argType.reduced(),
          Value.getColumnLike(v),
          mapFn
        );
      });
    });
  }
};
