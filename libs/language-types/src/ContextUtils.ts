import { Statement } from './AST';
import type { Type } from './Type/Type';
import { Value } from './Value/Value';

export interface ContextUtils {
  retrieveIndexByName: (indexName: string) => Type | null;
  retrieveVariableTypeByGlobalVariableName: (varName: string) => Type | null;
  retrieveVariableValueByGlobalVariableName: (varName: string) => Value | null;
  simpleExpressionEvaluate: (s: Statement) => Promise<Value>;
}
