import uniqBy from 'lodash.uniqby';
import { produce } from 'immer';

import type { Type } from '../type';
import { linearizeType } from './common';
import { enumerate, getDefined, getInstanceof } from '../utils';

import { Value, Column } from '../interpreter/Value';
import type { Dimension, HypercubeLike } from './hypercube';

function getDimensions(value: Value, type: Type) {
  const linearTypes = linearizeType(type);

  return (function recurse(value: Column, index = 0): Dimension[] {
    const thisType = linearTypes[index];

    const thisDim = {
      dimensionLength: value.rowCount,
      dimensionId: thisType.indexedBy ?? index,
    };
    if (thisType.cellType?.cellType) {
      const firstCell = getInstanceof(value.values[0], Column);
      return [thisDim, ...recurse(firstCell, index + 1)];
    } else {
      return [thisDim];
    }
  })(value as Column);
}

export const uniqDimensions = (dimensions: Dimension[]) =>
  uniqBy(dimensions, 'dimensionId');

const getDimensionId = (type: Type, index: number) => type.indexedBy ?? index;

export function groupTypesByDimension(...args: Type[][]) {
  const allDimensions = new Map();
  for (const arg of args) {
    for (const [index, type] of enumerate(arg)) {
      const dimensionId = getDimensionId(type, index);
      const array = allDimensions.get(dimensionId) ?? [];

      array.push(type);

      allDimensions.set(dimensionId, array);
    }
  }
  return [...allDimensions.values()];
}

export function hypercubeLikeToValue(hc: HypercubeLike): Value {
  return (function recurse(
    dims: Dimension[],
    coordinates: Map<string | number, number>
  ): Value {
    if (dims.length > 0) {
      const [firstDim, ...restDims] = dims;
      return Column.fromValues(
        Array.from({ length: firstDim.dimensionLength }, (_, i) => {
          const furtherCoordinates = produce(coordinates, (cursor) => {
            cursor.set(firstDim.dimensionId, i);
          });
          return recurse(restDims, furtherCoordinates);
        })
      );
    } else {
      return getAt(hc, coordinates);
    }
  })(uniqDimensions(hc.dimensions), new Map());
}

export function getAt(
  hc: HypercubeLike,
  coordinates: Map<string | number, number>
) {
  const uniqueDimensions = uniqDimensions(hc.dimensions);
  if (coordinates.size !== uniqueDimensions.length) {
    throw new Error(
      `panic: not enough keys: given ${[
        ...coordinates.keys(),
      ]} and wanted ${uniqueDimensions.map((d) => d.dimensionId)}`
    );
  }

  const linearArgs = hc.dimensions.map((dimVal) =>
    getDefined(coordinates.get(dimVal.dimensionId))
  );

  return hc.lowLevelGet(...linearArgs);
}

export class DimensionalValue implements HypercubeLike {
  value: Value;
  dimensions: Dimension[];

  constructor(column: Value, ...dimensions: Dimension[]) {
    this.value = column;
    this.dimensions = dimensions;
  }

  static fromColAndDim(column: Column, dimensionId: string | number) {
    return new DimensionalValue(column, {
      dimensionId,
      dimensionLength: column.rowCount,
    });
  }

  static fromValue(value: Value, type: Type) {
    const dimensions = type.cellType ? getDimensions(value, type) : [];

    return new DimensionalValue(value, ...dimensions);
  }

  lowLevelGet(...keys: number[]) {
    if (keys.length !== this.dimensions.length) {
      throw new Error(
        `panic: needed ${this.dimensions.length} keys, got ${keys.length} keys`
      );
    }
    let cursor: Value = this.value;
    while (keys.length) {
      const key = getDefined(keys.shift());
      cursor = getInstanceof(cursor, Column).values[key];
    }
    return cursor;
  }

  materialize() {
    return this.value.getData();
  }
}
