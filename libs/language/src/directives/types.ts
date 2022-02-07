import type { AST, Type } from '..';
import type { Value } from '../interpreter';

export interface GetTypeCtx {
  infer: (exp: AST.Expression) => Promise<Type>;
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
    ...args: AST.Node[]
  ): Promise<Type>;
  getValue(
    root: AST.Expression,
    ctx: GetValueCtx,
    ...args: AST.Node[]
  ): Promise<Value>;
}
