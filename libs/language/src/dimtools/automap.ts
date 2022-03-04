import { allMatch, zip } from '../utils';
import { Type, build as t } from '../type';
import * as Value from '../interpreter/Value';
import { getReductionPlan } from './getReductionPlan';
import {
  arrayOfOnes,
  compareDimensions,
  deLinearizeType,
  getCardinality,
  linearizeType,
  validateCardinalities,
  heightenValueDimensionsIfNecessary,
  heightenDimensionsIfNecessary,
} from './common';
import { Hypercube } from './hypercube';
import {
  DimensionalValue,
  groupTypesByDimension,
} from './multidimensional-utils';
import { materializeToValue } from './materialize';

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
  argTypes = heightenDimensionsIfNecessary(argTypes, expectedCardinalities);

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
  [argTypes, argValues] = heightenValueDimensionsIfNecessary(
    argTypes,
    argValues,
    expectedCardinalities
  );

  if (!validateCardinalities(argTypes, expectedCardinalities)) {
    throw new Error('panic: one or more cardinalities are too low');
  }

  const dimensionalArgs = zip(argTypes, argValues).map(([type, value]) =>
    DimensionalValue.fromValue(value, type)
  );

  if (expectedCardinalities.every((c) => c === 1)) {
    const reducedArgTypes = hackilyReduceArgTypes(
      argTypes,
      expectedCardinalities
    );
    const mapFnAndTypes = (values: Value.Value[]) =>
      mapFn(values, reducedArgTypes);

    return materializeToValue(new Hypercube(mapFnAndTypes, ...dimensionalArgs));
  } else {
    const whichToReduce = getReductionPlan(argTypes, expectedCardinalities);

    if (whichToReduce.every((doReduce) => doReduce === false)) {
      // Reduce nothing -- input dimensions are correct
      return mapFn(dimensionalArgs.map(materializeToValue), argTypes);
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
      return t.impossible(
        'Just satisfying mapFn protocol, nothing to see here'
      );
    },
    expectedCardinalities
  );

  return argTypesLowerDims;
};

export const automapTypesForReducer = (
  argType: Type,
  mapFn: (types: Type[]) => Type
): Type => {
  [argType] = heightenDimensionsIfNecessary([argType], [2]);

  if (!validateCardinalities([argType], [2])) {
    return t.impossible('A column is required');
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
  [[argType], [argValue]] = heightenValueDimensionsIfNecessary(
    [argType],
    [argValue],
    [2]
  );

  if (!validateCardinalities([argType], [2])) {
    throw new Error('panic: cardinality is too low');
  }

  if (getCardinality(argType) === 2) {
    return mapFn([argValue], [argType]);
  } else {
    return Value.Column.fromValues(
      Value.getColumnLike(
        argValue,
        'reducers always take columnar arguments'
      ).values.map((v) =>
        automapValuesForReducer(
          argType.reduced(),
          Value.getColumnLike(v),
          mapFn
        )
      )
    );
  }
};
