/* eslint-disable no-underscore-dangle */
import { Dimension, lowLevelGet } from '.';
import { getLabelIndex } from '../dimtools';
import { ColumnLikeValue } from '../value';
import { implementColumnLike } from './LazyAtIndex';
import { MinimalTensor } from './types';

const ConcatenatedColumn = implementColumnLike(
  class ConcatenatedColumn implements MinimalTensor {
    readonly _dimensions: Dimension[];
    readonly column1: ColumnLikeValue;
    readonly column2: ColumnLikeValue;

    /** Construct a column that concatenates the values of 2 columns. */
    constructor(
      column1: ColumnLikeValue,
      column2: ColumnLikeValue,
      dimensions: Dimension[]
    ) {
      this._dimensions = dimensions;
      this.column1 = column1;
      this.column2 = column2;
    }

    async dimensions() {
      return Promise.resolve(this._dimensions);
    }
    setDimensions() {
      throw new Error('not implemented');
    }

    async lowLevelGet(...keys: number[]) {
      const [firstKey, ...restKeys] = keys;
      const col1RowCount = await this.column1.rowCount();

      const item = await (firstKey < col1RowCount
        ? this.column1.atIndex(firstKey)
        : this.column2.atIndex(firstKey - col1RowCount));

      return lowLevelGet(item, restKeys);
    }

    async indexToLabelIndex(concatenatedIndex: number) {
      const column1RowCount = await this.column1.rowCount();
      if (concatenatedIndex < column1RowCount) {
        return getLabelIndex(this.column1, concatenatedIndex);
      } else {
        return getLabelIndex(this.column2, concatenatedIndex - column1RowCount);
      }
    }
  }
);

export const createConcatenatedColumn = async (
  column1: ColumnLikeValue,
  column2: ColumnLikeValue
): Promise<ColumnLikeValue> => {
  const [firstDim, ...restDims] = await column1.dimensions();
  const concatenatedDim = {
    dimensionLength:
      firstDim.dimensionLength +
      (await column2.dimensions())[0].dimensionLength,
  };
  const dimensions = [concatenatedDim, ...restDims];

  return new ConcatenatedColumn(column1, column2, dimensions);
};
