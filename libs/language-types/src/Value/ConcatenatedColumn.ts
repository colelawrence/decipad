/* eslint-disable no-underscore-dangle */
import { once } from '@decipad/utils';
import { getLabelIndex } from '../Dimension/getLabelIndex';
import { getDimensionLength } from '../utils/getDimensionLength';
import { implementColumnLike } from '../utils/implementColumnLike';
import type { MinimalTensor } from './MinimalTensor';
import { lowLevelGet } from './lowLevelGet';
import type { Dimension, Value, Result } from '@decipad/language-interfaces';
import { lowLowLevelGet } from './lowLowLevelGet';

const ConcatenatedColumn = implementColumnLike(
  class ConcatenatedColumn implements MinimalTensor {
    readonly _dimensions: Dimension[];
    readonly column1: Value.ColumnLikeValue;
    readonly column2: Value.ColumnLikeValue;

    meta: () => Result.ResultMetadataColumn;

    /** Construct a column that concatenates the values of 2 columns. */
    constructor(
      column1: Value.ColumnLikeValue,
      column2: Value.ColumnLikeValue,
      dimensions: Dimension[]
    ) {
      this._dimensions = dimensions;
      this.column1 = column1;
      this.column2 = column2;
      this.meta = () => {
        const labels = Promise.all([
          this.column1.meta?.()?.labels,
          this.column2.meta?.()?.labels,
        ]);
        return {
          labels: labels.then(([labels1 = [], labels2 = []]) =>
            labels1.map((label, i) => label.concat(labels2[i] ?? []))
          ),
        } satisfies Result.ResultMetadataColumn;
      };
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

    async lowLowLevelGet(...keys: number[]): Promise<Result.OneResult> {
      const [firstKey, ...restKeys] = keys;
      const col1RowCount = await this.column1.rowCount();

      const item = await (firstKey < col1RowCount
        ? this.column1.atIndex(firstKey)
        : this.column2.atIndex(firstKey - col1RowCount));

      return lowLowLevelGet(await item?.getData(), restKeys);
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
  column1: Value.ColumnLikeValue,
  column2: Value.ColumnLikeValue
): Promise<Value.ColumnLikeValue> => {
  const [firstDim, ...restDims] = await column1.dimensions();
  const concatenatedDim = {
    dimensionLength: once(
      async () =>
        (await getDimensionLength(firstDim.dimensionLength)) +
        (await getDimensionLength(
          (
            await column2.dimensions()
          )[0].dimensionLength
        ))
    ),
  };
  const dimensions = [concatenatedDim, ...restDims];
  return new ConcatenatedColumn(column1, column2, dimensions);
};
