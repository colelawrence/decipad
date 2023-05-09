import type { AST, Value } from '..';
import { buildType } from '..';
import { isExpression, isNode } from '../utils';
import { Realm } from '../interpreter';
import { Context, inferExpression, makeContext } from '../infer';

import { DirectiveImpl } from './types';
import { Type } from '../type';

export const directiveFor = (args: AST.Node[]): AST.Directive => {
  return {
    type: 'directive',
    args: ['directive', ...args],
  };
};

export const testGetValue = async (
  getValue: DirectiveImpl['getValue'],
  ...args: AST.Node[]
): Promise<Value> => {
  const ctx = makeContext();
  const realm = new Realm(ctx);
  const root = directiveFor(args);
  realm.inferContext.nodeTypes.set(root, buildType.number());

  // Preload passed arguments into ctx.nodeTypes
  for (const passedArg of args) {
    if (isExpression(passedArg)) {
      // eslint-disable-next-line no-await-in-loop
      await inferExpression(ctx, passedArg);
    }
  }

  return getValue(realm, root);
};

export const testGetType = async (
  getType: DirectiveImpl['getType'],
  ...args: [Context | AST.Node, ...AST.Node[]]
): Promise<Type> => {
  // Allow passing a context along with the args, it's useful for testing
  const [firstArg, ...restArgs] = args;
  const ctx = isNode(firstArg) ? makeContext() : firstArg;
  const argsWithoutCtx = isNode(firstArg) ? [firstArg, ...restArgs] : restArgs;

  return getType(ctx, directiveFor(argsWithoutCtx));
};
