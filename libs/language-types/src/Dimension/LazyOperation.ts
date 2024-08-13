/* eslint-disable no-underscore-dangle */
import type { Dimension, Result, Value } from '@decipad/language-interfaces';
import { getDefined, zip } from '@decipad/utils';
import type { MinimalTensor } from '../Value';
import { isColumnLike } from '../Value';
import type { Type } from '../Type';
import { implementColumnLike } from '../utils/implementColumnLike';
import type { DimensionId, HypercubeArg, OperationFunction } from './types';
import { uniqDimensions } from './uniqDimensions';
import type { ContextUtils } from '../ContextUtils';
import { getHypercubeArg } from './getHypercubeArg';

type TLazyOperation = MinimalTensor;

/**
 * Represents an operation and X amount of arguments. It's used to represent
 * operations without using RAM to represent results.
 *
 * Instead, getData() is used to materialize the data.
 */
const LazyOperation = implementColumnLike(
  class LazyOperation implements TLazyOperation {
    readonly op: OperationFunction;
    readonly args: HypercubeArg[];
    private _uniqDimensions: DimensionId[] | undefined;

    public meta: undefined | (() => Result.ResultMetadataColumn | undefined);

    constructor(
      op: OperationFunction,
      args: HypercubeArg[],
      meta: undefined | (() => Result.ResultMetadataColumn | undefined)
    ) {
      this.op = op;
      this.args = args;
      this.meta = meta;
    }

    async dimensionIds(): Promise<DimensionId[]> {
      if (!this._uniqDimensions) {
        this._uniqDimensions = await uniqDimensions(this.args);
      }

      return this._uniqDimensions;
    }

    async dimensions() {
      const retDimensions: Dimension[] = [];
      const seenDimensionIds = new Set<DimensionId>();

      for (const [arg, argDimIds] of this.args) {
        if (!isColumnLike(arg)) continue;

        for (const [argDim, dimId] of zip(
          // eslint-disable-next-line no-await-in-loop
          await arg.dimensions(),
          argDimIds
        )) {
          if (!seenDimensionIds.has(dimId)) {
            seenDimensionIds.add(dimId);
            retDimensions.push(argDim);
          }
        }
      }

      return retDimensions;
    }

    setDimensions() {
      throw new Error('not implemented');
    }

    async lowLevelGet(...keys: number[]): Promise<Value.Value> {
      if ((await this.dimensions()).length !== keys.length) {
        throw new Error('panic: mismatched dimensions in core lazy operation');
      }

      const dimensionIds = await this.dimensionIds();

      const operationArgs = await Promise.all(
        this.args.map(async ([arg, argDimIds]): Promise<Value.Value> => {
          if (isColumnLike(arg)) {
            // Key indices match dimensions indices
            const keysForThisArg = await Promise.all(
              argDimIds.map(async (argDim) => {
                const whichKey = dimensionIds.indexOf(argDim);

                return getDefined(
                  keys[whichKey],
                  'index out of bounds in core lazy operation'
                );
              })
            );

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
  args: HypercubeArg[],
  meta: undefined | (() => Result.ResultMetadataColumn | undefined)
): Promise<Value.Value> => {
  const lazyOperation = new LazyOperation(op, args, meta);
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
  argValues: Value.Value[],
  argTypes: Type[],
  meta: undefined | (() => Result.ResultMetadataColumn | undefined)
) => {
  const args = zip(argValues, argTypes).map(getHypercubeArg(utils));
  return createLazyOperationBase(op, args, meta);
};
