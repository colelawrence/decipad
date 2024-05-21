import { type Result } from '..';
import { type OneResult } from '../Result';
import { type Value } from './Value';

export interface TreeColumn {
  name: string;
  aggregation?: Result.Result | undefined;
}
export interface Tree extends Value {
  root: OneResult;
  rootAggregation: Result.Result | undefined;
  originalCardinality: number;
  children: Tree[];
  columns: TreeColumn[];
}
