import { DeepReadonly } from 'utility-types';

export interface ColumnLike<TValue> {
  readonly values: DeepReadonly<TValue[]>;
  atIndex(i: number): TValue | undefined;
  readonly rowCount: number;
}
