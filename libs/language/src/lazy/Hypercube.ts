import { Value } from '../interpreter/Value';
import { implementColumnLike } from './implementColumnLike';
import type {
  OperationFunction,
  HypercubeLike,
  Dimension,
  MinimalHypercube,
} from './types';

/**
 * Represents an operation and X amount of arguments. It's used to represent
 * operations without using RAM to represent results.
 *
 * Instead, getData() is used to materialize the data.
 */
export const Hypercube = implementColumnLike(
  class Hypercube implements MinimalHypercube {
    readonly op: OperationFunction;
    readonly args: HypercubeLike[];

    constructor(op: OperationFunction, ...args: HypercubeLike[]) {
      this.op = op;
      this.args = args;
    }

    get dimensions(): Dimension[] {
      return this.args.flatMap((arg) => arg.dimensions);
    }

    lowLevelGet(...keys: number[]): Value {
      let keyIndex = 0;
      const getInner = (arg: HypercubeLike): Value => {
        const keysWeNeed = arg.dimensions.length;
        const start = keyIndex;
        keyIndex += keysWeNeed;

        return arg.lowLevelGet(...keys.slice(start, keyIndex));
      };

      const { op, args } = this;
      return op(args.map(getInner));
    }
  }
);
