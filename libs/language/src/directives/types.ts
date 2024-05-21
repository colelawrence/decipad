import type { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
import type { AST, Value as ValueTypes } from '@decipad/language-interfaces';
import type { TRealm } from '../scopedRealm';

/**
 * Macros are for new language features that don't deserve their own AST node.
 * Often these are expressions that could've been modeled as function calls
 * But aren't because they need to see the AST to determine their result.
 */
export interface DirectiveImpl<D extends AST.Directive = AST.Directive> {
  getType(ctx: TRealm, root: D): PromiseOrType<Type>;
  getValue(ctx: TRealm, root: D): PromiseOrType<ValueTypes.Value>;
}
