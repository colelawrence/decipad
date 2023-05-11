import { zip } from '@decipad/utils';
import { isColumnLike, ColumnLikeValue, Table, Value } from '../value';
import type { AST, ExternalDataMap, Context } from '..';
import { Stack, StackNamespaceJoiner, StackNamespaceSplitter } from '../stack';
import { getDefined } from '../utils';
import { ExpressionCache } from '../expression-cache';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<Value>(undefined, tableItemsToTable, tableToTableItems);
  functions = new Map<string, AST.FunctionDefinition>();
  previousRow: Map<string | symbol, Value> | null = null;
  inferContext: Context;
  previousStatementValue?: Value;
  statementId?: string;
  expressionCache = new ExpressionCache<Value>();

  get externalData() {
    return this.inferContext.externalData;
  }
  set externalData(value: ExternalDataMap) {
    this.inferContext.externalData = value;
  }

  maybeGetTypeAt(node: AST.Node) {
    return node.inferredType;
  }

  getTypeAt(node: AST.Node) {
    return getDefined(
      this.maybeGetTypeAt(node),
      `Could not find type for ${node.type}`
    );
  }

  async withPush<T>(wrapper: () => Promise<T>): Promise<T> {
    const parentExpressionCache = this.expressionCache;
    this.expressionCache = new ExpressionCache(parentExpressionCache);
    try {
      return this.stack.withPush(wrapper);
    } finally {
      this.expressionCache = parentExpressionCache;
    }
  }

  async withPushCall<T>(wrapper: () => Promise<T>): Promise<T> {
    const parentExpressionCache = this.expressionCache;
    this.expressionCache = new ExpressionCache(parentExpressionCache);
    try {
      return this.stack.withPushCall(wrapper);
    } finally {
      this.expressionCache = parentExpressionCache;
    }
  }

  clearCacheForSymbols(symbols: string[]): void {
    this.expressionCache.clearCacheResultsForSymbols(symbols);
  }

  constructor(context: Context) {
    this.inferContext = context;
  }
}

const tableItemsToTable: StackNamespaceJoiner<Value> = (tableItems) => {
  for (const v of tableItems.values()) {
    if (!isColumnLike(v)) throw new Error('expected column-like');
  }
  return Table.fromMapping(tableItems as Map<string, ColumnLikeValue>);
};

const tableToTableItems: StackNamespaceSplitter<Value> = (table) => {
  if (table instanceof Table) {
    return zip(table.columnNames, table.columns);
  }
  return undefined;
};
