import type { AST, Context, Type } from '..';
import { Realm, Value } from '../interpreter';

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
  ctx: Context,
  name: string,
  args: AST.Node[]
): Promise<Type> =>
  expand.getType(ctx, getDirective(name, args.length).getType, args);

export const expandDirectiveToValue = (
  realm: Realm,
  name: string,
  args: AST.Node[]
): Promise<Value> =>
  expand.getValue(realm, getDirective(name, args.length).getValue, args);
