import type { AST, Value } from '@decipad/language-interfaces';
import type { Type } from './Type/Type';

export type CallBuiltinFunctor = (
  ctx: ContextUtils,
  funcName: string,
  argTypes: Type[],
  node: AST.Expression[]
) => Promise<Type>;

export type CallBuiltin = (
  ctx: ContextUtils,
  funcName: string,
  argsBeforeConvert: Value.Value[],
  argTypes: Type[],
  returnType: Type,
  node: AST.Expression[]
) => Promise<Value.Value>;

export type CallFunctor = (
  body: AST.Block,
  argNames: string[],
  args: Type[]
) => Promise<Type>;

export type CallValue = (
  body: AST.Block,
  argNames: string[],
  args: Value.Value[]
) => Promise<Value.Value>;

export interface ContextUtils {
  retrieveIndexByName: (indexName: string) => Type | null;
  retrieveVariableTypeByGlobalVariableName: (varName: string) => Type | null;
  retrieveVariableValueByGlobalVariableName: (
    varName: string
  ) => Value.Value | null;
  retrieveHumanVariableNameByGlobalVariableName: (varName: string) => string;
  simpleExpressionEvaluate: (s: AST.Statement) => Promise<Value.Value>;
  callBuiltinFunctor: CallBuiltinFunctor;
  callBuiltin: CallBuiltin;
  callFunctor: CallFunctor;
  callValue: CallValue;
}
