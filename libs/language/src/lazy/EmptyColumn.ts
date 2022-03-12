import { Dimension } from '.';
import { Value } from '../interpreter';
import { implementColumnLike } from './implementColumnLike';

/**
 * Sometimes we may access `.values[0]` of a column to figure out its dimensionality.
 * But some columns are empty!
 *
 * This class deals with that. To represent an empty column, you create one of these.
 * Column.fromValues() returns this when given dimension information and zero values
 */
export const EmptyColumn = implementColumnLike(
  class EmptyColumn {
    dimensions: Dimension[];

    constructor(dimensions: Dimension[]) {
      this.dimensions = [{ dimensionLength: 0 }, ...dimensions];
    }

    lowLevelGet(): Value {
      throw new Error('panic: Attempting to access an empty column');
    }
  }
);
