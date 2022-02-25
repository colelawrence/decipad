import type { AST, SerializedType, Type } from '..';
import type { Value } from '../interpreter';
import { OneResult } from '../interpreter/interpreter-types';

export interface GetTypeCtx {
  infer: (exp: AST.Expression, previous?: SerializedType) => Promise<Type>;
}

export interface GetValueCtx {
  getNodeType: (exp: AST.Expression) => Type;
  evaluate: (exp: AST.Expression) => Promise<Value>;
}

/**
 * Macros are for new language features that don't deserve their own AST node.
 * Often these are expressions that could've been modeled as function calls
 * But aren't because they need to see the AST to determine their result.
 */
export interface Directive {
  argCount: number;
  getType(
    root: AST.Expression,
    ctx: GetTypeCtx,
    args: AST.Node[],
    previous?: SerializedType
  ): Promise<Type>;
  getValue(
    root: AST.Expression,
    ctx: GetValueCtx,
    args: AST.Node[],
    previous?: OneResult
  ): Promise<Value>;
}
