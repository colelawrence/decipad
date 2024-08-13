import type { ColumnLike } from '@decipad/column';
import type { Value } from './Value';
import type { OneResult, ResultMetadataColumn } from '../Result';
import type { Dimension } from '../Dimension';

export interface ColumnLikeValue extends Value, ColumnLike<Value> {
  getData(): Promise<OneResult>;
  lowLevelGet(...keys: number[]): Promise<Value>;

  /** Useful when filtering or sorting.
   * By default the identity function is used and no index changes are assumed to exist */
  indexToLabelIndex?: (index: number) => number | Promise<number>;
  dimensions(): Promise<Dimension[]>;
  meta: undefined | (() => undefined | ResultMetadataColumn);
}
