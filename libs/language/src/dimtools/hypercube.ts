import uniqBy from 'lodash.uniqby';
import { produce, enableMapSet } from 'immer';

import { OneResult } from '../interpreter/interpreter-types';
import { getAt } from './multidimensional-utils';
import type { Value } from '../interpreter/Value';

enableMapSet();

export interface Dimension {
  dimensionId: string | number;
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
    const dims = uniqBy(this.dimensions, 'dimensionId');

    const recurse = (
      dims: Dimension[],
      coordinates: Map<string | number, number>
    ): OneResult => {
      if (dims.length > 0) {
        const [firstDim, ...restDims] = dims;
        return Array.from({ length: firstDim.dimensionLength }, (_, i) => {
          const innerCoords = produce(coordinates, (cursor) => {
            cursor.set(firstDim.dimensionId, i);
          });
          return recurse(restDims, innerCoords);
        });
      } else {
        return getAt(this, coordinates).getData();
      }
    };

    return recurse(dims, new Map());
  }
}
