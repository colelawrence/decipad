import { getDefined } from '@decipad/utils';
import { enableMapSet } from 'immer';
import { OneResult } from '../interpreter/interpreter-types';
import { Column, ColumnLike, Value } from '../interpreter/Value';
import { getInstanceof } from '../utils';
import { materialize, materializeToValue } from './materialize';

enableMapSet();

export type DimensionId = string | number;
export interface Dimension {
  dimensionId: DimensionId;
  dimensionLength: number;
}

// ColumnLike extends Value so this is a Value too
export interface HypercubeLike extends ColumnLike {
  lowLevelGet: (...indices: number[]) => Value;
  dimensions: Dimension[];
}

type OperationFunction = (values: Value[]) => Value;

/**
 * Represents an operation and X amount of arguments. It's used to represent
 * operations without using RAM to represent results.
 *
 * Instead, getData() is used to materialize the data.
 */
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

  get values(): readonly Value[] {
    return getInstanceof(materializeToValue(this), Column).values;
  }

  get rowCount() {
    const firstDim = getDefined(
      this.dimensions[0],
      'panic: getting row count from non-dimensional value'
    );
    return firstDim.dimensionLength;
  }

  atIndex(i: number) {
    return getDefined(this.values[i], `index ${i} out of bounds`);
  }

  /** Materialize a multi-dimensional hypercube wholesale. Needed to integrate with Value */
  getData(): OneResult {
    return materialize(this);
  }
}
