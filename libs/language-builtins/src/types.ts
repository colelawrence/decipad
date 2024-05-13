// eslint-disable-next-line no-restricted-imports
import type { ContextUtils, AST, Value, Type } from '@decipad/language-types';
import type { FullBuiltinSpec } from './interfaces';

export type CallBuiltinFunctor = (
  ctx: BuiltinContextUtils,
  funcName: string,
  argTypes: Type[],
  node: AST.Expression[],
  op?: FullBuiltinSpec
) => Promise<Type>;

export type CallBuiltin = (
  ctx: BuiltinContextUtils,
  funcName: string,
  argsBeforeConvert: Value.Value[],
  argTypes: Type[],
  returnType: Type,
  node: AST.Expression[],
  op?: FullBuiltinSpec
) => Promise<Value.Value>;

export type BuiltinContextUtils = ContextUtils & {
  callBuiltinFunctor: CallBuiltinFunctor;
  callBuiltin: CallBuiltin;
};
