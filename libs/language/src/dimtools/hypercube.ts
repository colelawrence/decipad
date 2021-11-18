import { enableMapSet } from 'immer';

import type { Value } from '../interpreter/Value';
import { materialize } from './materialize';

enableMapSet();

export type DimensionId = string | number;
export interface Dimension {
  dimensionId: DimensionId;
  dimensionLength: number;
}

export interface HypercubeLike {
  lowLevelGet: (...indices: number[]) => Value;
  dimensions: Dimension[];
}

type OperationFunction = (values: Value[]) => Value;
export class Hypercube implements HypercubeLike {
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

  /** Materialize a multi-dimensional hypercube wholesale. Needed to integrate with Value */
  materialize() {
    return materialize(this);
  }
}
