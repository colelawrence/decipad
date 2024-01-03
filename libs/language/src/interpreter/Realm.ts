import { getDefined, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { AST, ContextUtils, Value } from '@decipad/language-types';
import type { ExternalDataMap, Context } from '..';
import { Stack, StackNamespaceJoiner, StackNamespaceSplitter } from '../stack';
import { ExpressionCache } from '../expression-cache';
import { InterpreterStats, initialInterpreterStats } from './interpreterStats';
import { simpleExpressionEvaluate } from './simpleExpressionEvaluate';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<Value.Value>(
    undefined,
    tableItemsToTable,
    tableToTableItems
  );
  functions = new Map<string, AST.FunctionDefinition>();
  previousRow: Map<string | symbol, Value.Value> | null = null;
  inferContext: Context;
  previousStatementValue?: Value.Value;
  statementId?: string;
  expressionCache = new ExpressionCache<Value.Value>();
  stats: InterpreterStats = initialInterpreterStats();

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
      return await this.stack.withPush(wrapper);
    } finally {
      this.expressionCache = parentExpressionCache;
    }
  }

  async withPushCall<T>(wrapper: () => Promise<T>): Promise<T> {
    const parentExpressionCache = this.expressionCache;
    this.expressionCache = new ExpressionCache(parentExpressionCache);
    try {
      return await this.stack.withPushCall(wrapper);
    } finally {
      this.expressionCache = parentExpressionCache;
    }
  }

  clearCacheForSymbols(symbols: string[]): void {
    this.expressionCache.clearCacheResultsForSymbols(symbols);
  }

  clearStats() {
    Object.assign(this.stats, initialInterpreterStats());
  }

  incrementStatsCounter(key: keyof InterpreterStats, howMuch = 1) {
    this.stats[key] += howMuch;
  }

  get utils(): ContextUtils {
    return {
      ...this.inferContext.utils,
      simpleExpressionEvaluate: async (s: AST.Statement) =>
        simpleExpressionEvaluate(this, s),
      retrieveVariableValueByGlobalVariableName: (varName, group) =>
        this.stack.get(varName, group),
    };
  }

  constructor(context: Context) {
    this.inferContext = context;
  }
}

const tableItemsToTable: StackNamespaceJoiner<Value.Value> = (tableItems) => {
  for (const v of tableItems.values()) {
    if (!Value.isColumnLike(v)) throw new Error('expected column-like');
  }
  return Value.Table.fromMapping(
    tableItems as Map<string, Value.ColumnLikeValue>
  );
};

const tableToTableItems: StackNamespaceSplitter<Value.Value> = (table) => {
  if (table instanceof Value.Table) {
    return zip(table.columnNames, table.columns);
  }
  return undefined;
};
