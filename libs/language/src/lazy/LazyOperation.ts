/* eslint-disable no-underscore-dangle */
import { getDefined } from '@decipad/utils';
import { Type } from '..';
import { isColumnLike, Value } from '../value';
import { zip } from '../utils';
import { implementColumnLike } from './LazyAtIndex';
import type {
  Dimension,
  DimensionId,
  MinimalTensor,
  OperationFunction,
} from './types';
import { getHypercubeArg } from './getHypercubeArg';
import { uniqDimensions } from './uniqDimensions';

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
const LazyOperation = implementColumnLike(
  class LazyOperation implements MinimalTensor {
    readonly op: OperationFunction;
    readonly args: HypercubeArg[];

    private _dimensions: Dimension[];
    readonly dimensionIds: DimensionId[];

    constructor(
      op: OperationFunction,
      args: HypercubeArg[],
      dimensionIds: DimensionId[],
      dimensions: Dimension[]
    ) {
      this.op = op;
      this.args = args;
      this.dimensionIds = dimensionIds;
      this._dimensions = dimensions;
    }

    async dimensions() {
      return Promise.resolve(this._dimensions);
    }

    setDimensions() {
      throw new Error('not implemented');
    }

    async lowLevelGet(...keys: number[]): Promise<Value> {
      if ((await this.dimensions()).length !== keys.length) {
        throw new Error('panic: mismatched dimensions in core lazy operation');
      }

      const operationArgs = await Promise.all(
        this.args.map(async ([arg, argDimIds]): Promise<Value> => {
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
            return Promise.resolve(arg);
          }
        })
      );

      return this.op(operationArgs);
    }
  }
);

/**
 * Hypercubes can be 0-dimensional, but when using as a Value we don't want
 * this flexibility.
 */

export const createLazyOperationBase = async (
  op: OperationFunction,
  args: HypercubeArg[]
): Promise<Value> => {
  const [dimensionIds, dimensions] = await uniqDimensions(args);

  const lazyOperation = new LazyOperation(op, args, dimensionIds, dimensions);
  const dimensionCount = (await lazyOperation.dimensions()).length;
  if (dimensionCount > 0) {
    return lazyOperation;
  } else {
    return lazyOperation.lowLevelGet();
  }
};

export const createLazyOperation = async (
  op: OperationFunction,
  argValues: Value[],
  argTypes: Type[]
) => {
  const args = zip(argValues, argTypes).map(getHypercubeArg);
  return createLazyOperationBase(op, args);
};
