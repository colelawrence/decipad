import { Dimension, lowLevelGet } from '.';
import { getLabelIndex } from '../dimtools';
import { ColumnLikeValue } from '../value';
import { implementColumnLike } from './LazyAtIndex';
import { MinimalTensor } from './types';

export const ColumnSlice = implementColumnLike(
  class _ColumnSlice implements MinimalTensor {
    readonly begin: number;
    readonly end: number;
    readonly sourceColumn: ColumnLikeValue;
    readonly dimensions: Dimension[];

    constructor(sourceColumn: ColumnLikeValue, begin: number, end: number) {
      this.sourceColumn = sourceColumn;
      this.begin = begin;
      this.end = end;
      this.dimensions = [
        { dimensionLength: this.end - this.begin },
        ...sourceColumn.dimensions.slice(1),
      ];
    }

    static fromColumnAndRange(
      column: ColumnLikeValue,
      begin: number,
      end: number
    ) {
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
