/* eslint-disable no-underscore-dangle */
import type { Result, Value, Dimension } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
import { UnknownValue } from './Unknown';
import { implementColumnLike } from '../utils/implementColumnLike';

/**
 * Sometimes we may access `.values[0]` of a column to figure out its dimensionality.
 * But some columns are empty!
 *
 * This class deals with that. To represent an empty column, you create one of these.
 * Column.fromValues() returns this when given dimension information and zero values
 */
export const EmptyColumn = implementColumnLike(
  class EmptyColumn implements Value.LowLevelMinimalTensor {
    _dimensions: Dimension[];
    meta = undefined;

    constructor(dimensions: Dimension[]) {
      this._dimensions = [{ dimensionLength: 0 }, ...dimensions];
    }

    async dimensions() {
      return Promise.resolve(this._dimensions);
    }

    setDimensions() {
      throw new Error('not implemented');
    }

    async lowLevelGet(): Promise<Value.Value> {
      return UnknownValue;
    }

    async lowLowLevelGet(): Promise<Result.OneResult> {
      return Unknown;
    }

    async indexToLabelIndex(): Promise<number> {
      throw new Error(
        'panic: Attempting to get source index on an empty column'
      );
    }
  }
);
