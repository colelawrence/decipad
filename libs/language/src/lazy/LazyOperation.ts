import { getDefined } from '@decipad/utils';
import { Type } from '..';
import { typeToDimensionIds } from '../dimtools/common';
import { isColumnLike, Value } from '../value';
import { zip } from '../utils';
import { implementColumnLike } from './LazyAtIndex';
import type {
  Dimension,
  DimensionId,
  MinimalTensor,
  OperationFunction,
} from './types';

export type HypercubeArg = [arg: Value, argDimensionIds: DimensionId[]];
export type HypercubeArgLoose = [
  arg: Value,
  dimensionLike: DimensionId[] | Type
];

/**
 * Represents an operation and X amount of arguments. It's used to represent
 * operations without using RAM to represent results.
 *
 * Instead, getData() is used to materialize the data.
 */
export const LazyOperation = implementColumnLike(
  class LazyOperation implements MinimalTensor {
    readonly op: OperationFunction;
    readonly args: HypercubeArg[];

    readonly dimensions: Dimension[];
    readonly dimensionIds: DimensionId[];

    constructor(op: OperationFunction, ...args: HypercubeArgLoose[]) {
      this.op = op;
      this.args = args.map(getHypercubeArg);

      const [dimensionIds, dimensions] = uniqDimensions(this.args);
      this.dimensionIds = dimensionIds;
      this.dimensions = dimensions;
    }

    lowLevelGet(...keys: number[]): Value {
      if (this.dimensions.length !== keys.length) {
        throw new Error('panic: mismatched dimensions in core lazy operation');
      }

      const operationArgs = this.args.map(([arg, argDimIds]): Value => {
        if (isColumnLike(arg)) {
          // Key indices match dimensions indices
          const keysForThisArg = argDimIds.map((argDim) => {
            const whichKey = this.dimensionIds.findIndex(
              (myDim) => myDim === argDim
            );

            return getDefined(
              keys[whichKey],
              'index out of bounds in core lazy operation'
            );
          });

          return arg.lowLevelGet(...keysForThisArg);
        } else {
          return arg;
        }
      });

      return this.op(operationArgs);
    }
  }
);

/**
 * Hypercubes can be 0-dimensional, but when using as a Value we don't want
 * this flexibility.
 */
export const createLazyOperation = (
  op: OperationFunction,
  argValues: Value[],
  argTypes: Type[]
) => {
  const lazyOperation = new LazyOperation(op, ...zip(argValues, argTypes));
  if (lazyOperation.dimensions.length) {
    return lazyOperation;
  } else {
    return lazyOperation.lowLevelGet();
  }
};

export const getHypercubeArg = ([value, dimsOrType]: HypercubeArgLoose) => {
  const dims = Array.isArray(dimsOrType)
    ? dimsOrType
    : typeToDimensionIds(dimsOrType);
  return [value, dims] as HypercubeArg;
};

export const uniqDimensions = (
  args: HypercubeArg[]
): [DimensionId[], Dimension[]] => {
  const retDimensions = new Map<DimensionId, Dimension>();

  for (const [arg, argDimIds] of args) {
    if (!isColumnLike(arg)) continue;

    for (const [argDim, dimId] of zip(arg.dimensions, argDimIds)) {
      if (!retDimensions.has(dimId)) {
        retDimensions.set(dimId, argDim);
      }
    }
  }

  return [[...retDimensions.keys()], [...retDimensions.values()]];
};
