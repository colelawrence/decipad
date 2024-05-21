import type { Result, Value } from '@decipad/language-interfaces';

export interface TreeColumn {
  name: string;
  aggregation?: Result.Result | undefined;
}
export class Tree implements Value.Value {
  root: Result.OneResult;
  rootAggregation: Result.Result | undefined;
  originalCardinality: number;
  children: Tree[];
  columns: TreeColumn[];

  constructor(
    root: Result.OneResult,
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
  async getData(): Promise<Result.OneResult> {
    return this;
  }

  static empty(root: Result.OneResult) {
    return new Tree(root, undefined, [], []);
  }

  static from(
    root: Result.OneResult,
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

export const isTreeValue = (v: unknown): v is Tree => v instanceof Tree;
