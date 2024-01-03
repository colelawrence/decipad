import { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { AST, Type, Value } from '@decipad/language-types';
import { Realm } from '../interpreter/Realm';

/**
 * Macros are for new language features that don't deserve their own AST node.
 * Often these are expressions that could've been modeled as function calls
 * But aren't because they need to see the AST to determine their result.
 */
export interface DirectiveImpl<D extends AST.Directive = AST.Directive> {
  getType(ctx: Realm, root: D): PromiseOrType<Type>;
  getValue(ctx: Realm, root: D): PromiseOrType<Value.Value>;
}
