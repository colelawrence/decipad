import { all, map } from '@decipad/generator-utils';
import { getDefined, once, type PromiseOrType } from '@decipad/utils';
import type { ContextUtils } from '../ContextUtils';
import type { Type } from '../Type';
import { isPendingType, serializeType, buildType as t } from '../Type';
import {
  arrayOfOnes,
  findFirstInValidCardinality,
  findFirstValidCardinality,
  getCardinality,
} from './cardinality';
import { deLinearizeType, linearizeType } from './linearizeType';
import { groupTypesByDimension } from './groupTypesByDimension';
import { createLazyOperation } from './LazyOperation';
import { getReductionPlan } from './getReductionPlan';
import { getColumnLike, isColumnLike } from '../Value/ColumnLike';
import { Column, FMappedColumn, isTableValue } from '../Value';
import { buildResult } from '../utils/buildResult';
import { getResultGenerator } from '../utils/getResultGenerator';
import { resultToValue } from '../utils/resultToValue';
import type { Result, Value } from '@decipad/language-interfaces';

// Minor hack: use the automaptypes function to retrieve the arg types
// Better solution: Make Hypercube type-aware and pass the types from there.
const hackilyReduceArgTypes = async (
  ctx: ContextUtils,
  argTypes: Type[],
  expectedCardinalities: number[]
) => {
  let argTypesLowerDims: Type[] = [];
  await automapTypes(
    ctx,
    argTypes,
    (argTypesFromMapTypes) => {
      argTypesLowerDims = argTypesFromMapTypes;

      // Just satisfying mapFn protocol, nothing to see here
      return t.nothing();
    },
    [expectedCardinalities]
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
  ctx: ContextUtils,
  argTypes: Type[],
  mapFn: (types: Type[]) => Type | Promise<Type>,
  availableCardinalities = [arrayOfOnes(argTypes.length)]
): Promise<Type> => {
  // pending is contagious
  {
    const pending = argTypes.find(isPendingType);
    if (pending) {
      return pending;
    }
  }

  const matchedCardinality = findFirstValidCardinality(
    argTypes,
    availableCardinalities
  );

  if (!matchedCardinality) {
    return getDefined(
      findFirstInValidCardinality(argTypes, availableCardinalities)
    ).expected(t.column(t.anything()));
  }

  if (matchedCardinality.every((c) => c === 1)) {
    // all cardinalities are the same
    // Expand dimensions by returning the union of all arguments' dims
    const linearTypedArgs = argTypes.map(linearizeType);
    const scalarArgs = linearTypedArgs.map((types) => types[types.length - 1]);

    // pending is contagious
    {
      const pending = scalarArgs.find(isPendingType);
      if (pending) {
        return pending;
      }
    }

    const allDimensions = groupTypesByDimension(
      ctx,
      ...linearTypedArgs.map((item) => item.slice(0, -1))
    );

    const composedType = deLinearizeType([
      ...allDimensions.map((t) => t[0]),
      await mapFn(scalarArgs),
    ]);

    return composedType;
  } else {
    const whichToReduce = getReductionPlan(argTypes, matchedCardinality);

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

const emptyLabelsMeta = { labels: undefined };

const getMeta = (
  value: Value.ColumnLikeValue | Value.TableValue
): undefined | Result.ResultMetadataColumn => {
  const existingMeta = value.meta?.();
  if (existingMeta?.labels) {
    return existingMeta;
  }
  if (isColumnLike(value)) {
    return {
      labels: Promise.all([
        value
          .getData()
          .then(async (data) =>
            all(map(getResultGenerator(data)(), (d) => d?.toString() ?? ''))
          ),
      ]),
    };
  }
  return existingMeta;
};

const getDeepMetaRecursive = (
  argValues: Array<Value.ColumnLikeValue | Value.TableValue>
): undefined | Result.ResultMetadataColumn => {
  if (argValues.length === 0) {
    return emptyLabelsMeta;
  }
  const [argValue, ...rest] = argValues;
  if (rest.length === 0) {
    return argValue.meta?.();
  }

  let { labels } = getMeta(argValue) ?? {};
  if (labels == null) {
    labels = Promise.resolve([[]]);
  }
  const restLabels = getDeepMetaRecursive(rest)?.labels;
  return {
    labels: Promise.all([labels, restLabels]).then(([labels, restLabels]) =>
      labels.concat(restLabels ?? [])
    ),
  };
};

const getDeepMeta = (
  argValues: Value.Value[]
): undefined | (() => undefined | Result.ResultMetadataColumn) => {
  return once(() => {
    return getDeepMetaRecursive(
      argValues.filter((v) => isTableValue(v) || isColumnLike(v)) as Array<
        Value.ColumnLikeValue | Value.TableValue
      >
    );
  });
};

export const automapValues = async (
  ctx: ContextUtils,
  argTypes: Type[],
  argValues: Value.Value[],
  mapFn: (
    values: Value.Value[],
    types: Type[],
    ctx: ContextUtils
  ) => PromiseOrType<Value.Value>,
  availableCardinalities = [arrayOfOnes(argValues.length)]
): Promise<Value.Value> => {
  const matchedCardinality = findFirstValidCardinality(
    argTypes,
    availableCardinalities
  );

  if (!matchedCardinality) {
    throw new Error('panic: one or more cardinalities are too low');
  }

  if (matchedCardinality.every((c) => c === 1)) {
    const reducedArgTypes = await hackilyReduceArgTypes(
      ctx,
      argTypes,
      matchedCardinality
    );
    const mapFnAndTypes = async (values: Value.Value[]) => {
      return mapFn(values, reducedArgTypes, ctx);
    };

    return createLazyOperation(
      ctx,
      mapFnAndTypes,
      argValues,
      argTypes,
      getDeepMeta(argValues)
    );
  } else {
    const whichToReduce = getReductionPlan(argTypes, matchedCardinality);

    if (whichToReduce.every((doReduce) => doReduce === false)) {
      // Reduce nothing -- input dimensions are correct
      return mapFn(argValues, argTypes, ctx);
    } else {
      const [argValue] = argValues;
      if (argTypes.length === 1 && isColumnLike(argValue)) {
        const [argType] = argTypes;
        const reducedArgType = await argType.reduced();
        const serializedReducedArgType = serializeType(reducedArgType);
        return FMappedColumn.fromGeneratorAndType(
          getResultGenerator(await argValue.getData()),
          serializedReducedArgType,
          async (value) =>
            (
              await automapValues(
                ctx,
                [reducedArgType],
                [
                  resultToValue(
                    buildResult(
                      serializedReducedArgType,
                      value,
                      argValue.meta?.bind(argValue)
                    )
                  ),
                ],
                mapFn
              )
            ).getData(),
          argValue.meta?.bind(argValue),
          `automapValues`
        );
      }
      console.error(
        'Operating upon multiple dimensional values is not supported yet',
        argTypes
      );
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
  const matchedCardinality = findFirstValidCardinality([argType], [[2]]);
  if (!matchedCardinality) {
    return getDefined(findFirstInValidCardinality([argType], [[2]])).expected(
      t.column(t.anything())
    );
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
  utils: ContextUtils,
  mapFn: (
    values: Value.Value[],
    types: Type[],
    utils: ContextUtils
  ) => PromiseOrType<Value.Value>
): Promise<Value.Value> => {
  const matchedCardinality = findFirstValidCardinality([argType], [[2]]);
  if (!matchedCardinality) {
    throw new Error('panic: cardinality is too low');
  }

  const cardinality = getCardinality(argType);
  if (cardinality === 2) {
    return mapFn([argValue], [argType], utils);
  } else {
    const argCol = getColumnLike(
      argValue,
      'reducers always take columnar arguments'
    );
    // TODO: replace with a more efficient implementation that uses OneResult results
    return Column.fromGenerator(
      (start?: number, end?: number) => {
        return map(argCol.values(start, end), async (v) => {
          return automapValuesForReducer(
            await argType.reduced(),
            getColumnLike(v),
            utils,
            mapFn
          );
        });
      },
      argCol.meta?.bind(argCol),
      `automapValuesForReducer<${serializeType(argType).kind}>`
    );
  }
};
