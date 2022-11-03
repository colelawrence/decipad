import type { AST, Context, Type } from '..';
import type { Realm } from '../interpreter';
import type { Value } from '../value';

import { directives } from './directives';
import * as expand from './expand';

const getDirective = (directiveName: string, argCount: number) => {
  const directive = directives[directiveName];
  if (directive == null) {
    throw new Error(`panic: could not find directive ${directiveName}`);
  }
  if (directive.argCount !== argCount) {
    throw new Error(
      `panic: incorrect number of arguments for directive ${directiveName}`
    );
  }
  return directive;
};

export const expandDirectiveToType = (
  root: AST.Expression,
  ctx: Context,
  name: string,
  args: AST.Node[]
): Promise<Type> =>
  expand.getType(root, ctx, getDirective(name, args.length).getType, args);

export const expandDirectiveToValue = (
  root: AST.Expression,
  realm: Realm,
  name: string,
  args: AST.Node[]
): Promise<Value> =>
  expand.getValue(root, realm, getDirective(name, args.length).getValue, args);
