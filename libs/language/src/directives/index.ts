import type { AST, Context, Type } from '..';
import type { Realm } from '../interpreter';
import type { Value } from '../value';

import { directives } from './directives';

export const expandDirectiveToType = async (
  ctx: Context,
  root: AST.Directive
): Promise<Type> => directives[root.args[0]].getType(ctx, root);

export const expandDirectiveToValue = async (
  realm: Realm,
  root: AST.Directive
): Promise<Value> => directives[root.args[0]].getValue(realm, root);
