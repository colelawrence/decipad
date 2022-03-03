import uniqBy from 'lodash.uniqby';
import { Column, ColumnLike, getColumnLike, Value } from '../interpreter/Value';
import type { Type } from '../type';
import { enumerate, getDefined } from '../utils';
import { linearizeType } from './common';
import type { Dimension, HypercubeLike } from './hypercube';

function getDimensions(value: Value, type: Type) {
  const linearTypes = linearizeType(type);

  return (function recurse(value: ColumnLike, index = 0): Dimension[] {
    const thisType = linearTypes[index];

    const thisDim = {
      dimensionLength: value.rowCount,
      dimensionId: thisType.indexedBy ?? index,
    };
    if (thisType.cellType?.cellType) {
      const firstCell = getColumnLike(value.values[0]);
      return [thisDim, ...recurse(firstCell, index + 1)];
    } else {
      return [thisDim];
    }
  })(getColumnLike(value));
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
    for (const index of keys) {
      cursor = getColumnLike(cursor).atIndex(index);
    }
    return cursor;
  }

  get values(): readonly Value[] {
    return getColumnLike(this.value).values;
  }

  get rowCount() {
    return getColumnLike(this.value).rowCount;
  }

  atIndex(i: number) {
    return getColumnLike(this.value).atIndex(i);
  }

  getData() {
    return this.value.getData();
  }
}
