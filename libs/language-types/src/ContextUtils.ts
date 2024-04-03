import { AST } from '.';
import { type Statement, type Expression } from './AST';
import type { Type } from './Type/Type';
import { Value } from './Value/Value';

export type CallBuiltinFunctor = (
  ctx: ContextUtils,
  funcName: string,
  argTypes: Type[],
  node?: Expression[]
) => Promise<Type>;

export type CallBuiltin = (
  ctx: ContextUtils,
  funcName: string,
  argsBeforeConvert: Value[],
  argTypes: Type[],
  returnType: Type
) => Promise<Value>;

export type CallFunctor = (
  body: AST.Block,
  argNames: string[],
  args: Type[]
) => Promise<Type>;

export type CallValue = (
  body: AST.Block,
  argNames: string[],
  args: Value[]
) => Promise<Value>;

export interface ContextUtils {
  retrieveIndexByName: (indexName: string) => Type | null;
  retrieveVariableTypeByGlobalVariableName: (varName: string) => Type | null;
  retrieveVariableValueByGlobalVariableName: (varName: string) => Value | null;
  simpleExpressionEvaluate: (s: Statement) => Promise<Value>;
  callBuiltinFunctor: CallBuiltinFunctor;
  callBuiltin: CallBuiltin;
  callFunctor: CallFunctor;
  callValue: CallValue;
}
