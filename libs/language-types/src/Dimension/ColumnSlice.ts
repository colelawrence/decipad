/* eslint-disable no-underscore-dangle */
import { Dimension } from '..';
import { ColumnLikeValue, MinimalTensor } from '../Value';
import { lowLevelGet } from '../Value/lowLevelGet';
import { implementColumnLike } from '../utils';
import { getLabelIndex } from './getLabelIndex';

const ColumnSlice = implementColumnLike(
  class _ColumnSlice implements MinimalTensor {
    readonly begin: number;
    readonly end: number;
    readonly sourceColumn: ColumnLikeValue;
    readonly _dimensions: Dimension.Dimension[];

    constructor(
      sourceColumn: ColumnLikeValue,
      begin: number,
      end: number,
      dimensions: Dimension.Dimension[]
    ) {
      this.sourceColumn = sourceColumn;
      this.begin = begin;
      this.end = end;

      this._dimensions = [
        { dimensionLength: this.end - this.begin },
        ...dimensions,
      ];
    }

    async dimensions() {
      return Promise.resolve(this._dimensions);
    }
    setDimensions() {
      throw new Error('not implemented');
    }

    async lowLevelGet(...keys: number[]) {
      const [firstKey, ...restKeys] = keys;

      if (
        firstKey < 0 ||
        firstKey > (await this.dimensions())[0].dimensionLength
      ) {
        throw new Error(`panic: index ${firstKey} out of bounds`);
      }
      return lowLevelGet(this.sourceColumn, [
        firstKey + this.begin,
        ...restKeys,
      ]);
    }

    async indexToLabelIndex(outIndex: number) {
      return getLabelIndex(this.sourceColumn, outIndex + this.begin);
    }
  }
);

export const createColumnSlice = async (
  sourceColumn: ColumnLikeValue,
  begin: number,
  end: number
): Promise<ColumnLikeValue> => {
  const dimensions = (await sourceColumn.dimensions()).slice(1);
  return new ColumnSlice(sourceColumn, begin, end, dimensions);
};
