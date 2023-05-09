import { PromiseOrType } from '@decipad/utils';
import type { AST, Context, Realm, Type } from '..';
import type { Value } from '../value';

/**
 * Macros are for new language features that don't deserve their own AST node.
 * Often these are expressions that could've been modeled as function calls
 * But aren't because they need to see the AST to determine their result.
 */
export interface DirectiveImpl<D extends AST.Directive = AST.Directive> {
  getType(ctx: Context, root: D): PromiseOrType<Type>;
  getValue(ctx: Realm, root: D): PromiseOrType<Value>;
}
