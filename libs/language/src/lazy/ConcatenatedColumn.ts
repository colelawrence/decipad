import { Dimension, lowLevelGet } from '.';
import { getLabelIndex } from '../dimtools';
import { ColumnLike } from '../value';
import { implementColumnLike } from './HypercubeAtIndex';
import { MinimalHypercube } from './types';

export const ConcatenatedColumn = implementColumnLike(
  class ConcatenatedColumn implements MinimalHypercube {
    dimensions: Dimension[];
    column1: ColumnLike;
    column2: ColumnLike;

    /** Construct a column that concatenates the values of 2 columns. */
    constructor(column1: ColumnLike, column2: ColumnLike) {
      const [firstDim, ...restDims] = column1.dimensions;

      const concatenatedDim = {
        dimensionLength:
          firstDim.dimensionLength + column2.dimensions[0].dimensionLength,
      };

      this.dimensions = [concatenatedDim, ...restDims];
      this.column1 = column1;
      this.column2 = column2;
    }

    lowLevelGet(...keys: number[]) {
      const [firstKey, ...restKeys] = keys;

      const item =
        firstKey < this.column1.rowCount
          ? this.column1.atIndex(firstKey)
          : this.column2.atIndex(firstKey - this.column1.rowCount);

      return lowLevelGet(item, restKeys);
    }

    indexToLabelIndex(concatenatedIndex: number) {
      if (concatenatedIndex < this.column1.rowCount) {
        return getLabelIndex(this.column1, concatenatedIndex);
      } else {
        return getLabelIndex(
          this.column2,
          concatenatedIndex - this.column1.rowCount
        );
      }
    }
  }
);
