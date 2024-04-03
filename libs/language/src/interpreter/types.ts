import type { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { AST, ContextUtils, Type, Value } from '@decipad/language-types';
import type { ExternalDataMap, Context } from '..';
import type { Stack } from '../stack';
import type { ExpressionCache } from '../expression-cache';
import type { InterpreterStats } from './interpreterStats';

export type TRealm = {
  stack: Stack<Value.Value>;
  functions: Map<string, AST.FunctionDefinition>;
  previousRow: Map<string | symbol, Value.Value> | null;
  inferContext: Context;
  previousStatementValue?: Value.Value;
  statementId?: string;
  expressionCache: ExpressionCache<Value.Value>;
  stats: InterpreterStats;
  externalData: ExternalDataMap;
  maybeGetTypeAt(node: AST.Node): Type | undefined;
  getTypeAt(node: AST.Node): Type;
  scopedToDepth<T>(depth: number, wrapper: () => PromiseOrType<T>): Promise<T>;
  withPush<T>(wrapper: () => Promise<T>): Promise<T>;
  clearCacheForSymbols(symbols: string[]): void;
  clearStats(): void;
  incrementStatsCounter(key: keyof InterpreterStats, howMuch?: number): void;
  get utils(): ContextUtils;
};
