import { type Result } from '..';
import { type OneResult } from '../Result';
import { type Value } from './Value';

export interface TreeColumn {
  name: string;
  aggregation?: Result.Result | undefined;
}
export class Tree implements Value {
  root: OneResult;
  rootAggregation: Result.Result | undefined;
  originalCardinality: number;
  children: Tree[];
  columns: TreeColumn[];

  constructor(
    root: OneResult,
    rootAggregation: Result.Result | undefined,
    children: Tree[],
    columns: TreeColumn[],
    originalCardinality = 1
  ) {
    this.root = root;
    this.rootAggregation = rootAggregation;
    if (!children) {
      throw new Error('children are required');
    }
    this.children = children;
    if (!columns) {
      throw new Error('columns are required');
    }
    this.columns = columns;
    this.originalCardinality = originalCardinality;
  }
  async getData(): Promise<OneResult> {
    return this;
  }

  static empty(root: OneResult) {
    return new Tree(root, undefined, [], []);
  }

  static from(
    root: OneResult,
    rootAggregation: Result.Result | undefined,
    children: Tree[],
    columns: TreeColumn[],
    originalCardinality: number = 1
  ) {
    return new Tree(
      root,
      rootAggregation,
      children,
      columns,
      originalCardinality
    );
  }
}

export const isTreeValue = (v: Value | undefined | null): v is Tree =>
  v instanceof Tree;
