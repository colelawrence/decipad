import { PromiseOrType, getDefined, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { AST, ContextUtils, Value } from '@decipad/language-types';
import type { ExternalDataMap, Context } from '..';
import {
  StackNamespaceJoiner,
  StackNamespaceSplitter,
  createStack,
} from '../stack';
import { ExpressionCache } from '../expression-cache';
import { InterpreterStats, initialInterpreterStats } from './interpreterStats';
import { simpleExpressionEvaluate } from './simpleExpressionEvaluate';
import { functionCallValue } from './functionCallValue';
import { internalInferFunction } from '../infer/functions';
import { TRealm } from './types';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm implements TRealm {
  stack = createStack<Value.Value>(
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

  async scopedToDepth<T>(
    depth: number,
    wrapper: () => PromiseOrType<T>
  ): Promise<T> {
    const stackBefore = this.stack;
    this.stack = stackBefore.scopedToDepth(depth);
    try {
      return await wrapper();
    } finally {
      this.stack = stackBefore;
    }
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
      retrieveVariableValueByGlobalVariableName: (varName) =>
        this.stack.get(varName),
      callValue: async (body, argNames, args) =>
        functionCallValue(this, body, argNames, args),
      callFunctor: async (...args) => internalInferFunction(this, ...args),
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
