import { Dimension, lowLevelGet } from '.';
import { getLabelIndex } from '../dimtools';
import { ColumnLike } from '../value';
import { implementColumnLike } from './HypercubeAtIndex';
import { MinimalHypercube } from './types';

export const ColumnSlice = implementColumnLike(
  class _ColumnSlice implements MinimalHypercube {
    begin: number;
    end: number;
    sourceColumn: ColumnLike;
    dimensions: Dimension[];

    constructor(sourceColumn: ColumnLike, begin: number, end: number) {
      this.sourceColumn = sourceColumn;
      this.begin = begin;
      this.end = end;
      this.dimensions = [
        { dimensionLength: this.end - this.begin },
        ...sourceColumn.dimensions.slice(1),
      ];
    }

    static fromColumnAndRange(column: ColumnLike, begin: number, end: number) {
      return new ColumnSlice(column, begin, end);
    }

    lowLevelGet(...keys: number[]) {
      const [firstKey, ...restKeys] = keys;

      if (firstKey < 0 || firstKey > this.dimensions[0].dimensionLength) {
        throw new Error(`panic: index ${firstKey} out of bounds`);
      }
      return lowLevelGet(this.sourceColumn, [
        firstKey + this.begin,
        ...restKeys,
      ]);
    }

    indexToLabelIndex(outIndex: number) {
      return getLabelIndex(this.sourceColumn, outIndex + this.begin);
    }
  }
);
