import { Statement } from './AST';
import type { Type } from './Type/Type';
import { Value } from './Value/Value';

export type VarGroup = 'global' | 'lexical' | 'function';

export interface ContextUtils {
  retrieveIndexByName: (indexName: string) => Type | null;
  retrieveVariableTypeByGlobalVariableName: (varName: string) => Type | null;
  retrieveVariableValueByGlobalVariableName: (
    varName: string,
    group?: VarGroup
  ) => Value | null;
  simpleExpressionEvaluate: (s: Statement) => Promise<Value>;
}
