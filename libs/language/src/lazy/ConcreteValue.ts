import { linearizeType } from '../dimtools/common';
import { Column, ColumnLike, getColumnLike, Value } from '../interpreter/Value';
import type { Dimension, HypercubeLike } from '.';
import type { Type } from '../type';

/**
 * A value with a set of dimensions. This is used to create an
 * abstract value out of a concrete column.
 */
export class ConcreteValue implements HypercubeLike {
  value: Value;
  dimensions: Dimension[];

  constructor(column: Value, ...dimensions: Dimension[]) {
    this.value = column;
    this.dimensions = dimensions;
  }

  static fromColAndDim(column: Column, dimensionId: string | number) {
    return new ConcreteValue(column, {
      dimensionId,
      dimensionLength: column.rowCount,
    });
  }

  static fromValue(value: Value, type: Type) {
    const dimensions = type.cellType ? getDimensions(value, type) : [];

    return new ConcreteValue(value, ...dimensions);
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
