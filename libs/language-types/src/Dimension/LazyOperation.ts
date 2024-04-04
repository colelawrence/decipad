/* eslint-disable no-underscore-dangle */
import { getDefined, zip } from '@decipad/utils';
import type { MinimalTensor, Value } from '../Value';
import { isColumnLike } from '../Value';
import type { Type } from '../Type';
import { implementColumnLike } from '../utils/implementColumnLike';
import type { DimensionId, OperationFunction } from './types';
import type { Dimension } from './Dimension';
import { uniqDimensions } from './uniqDimensions';
import { getHypercubeArg } from './getHypercubeArg';
import type { ContextUtils } from '../ContextUtils';

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
  utils: ContextUtils,
  op: OperationFunction,
  argValues: Value[],
  argTypes: Type[]
) => {
  const args = zip(argValues, argTypes).map(getHypercubeArg(utils));
  return createLazyOperationBase(op, args);
};
