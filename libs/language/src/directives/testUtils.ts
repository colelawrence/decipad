import type { AST } from '..';
import { buildType } from '..';
import { isExpression } from '../utils';
import { Realm } from '../interpreter';
import { inferExpression, makeContext } from '../infer';

import { Directive } from './types';
import * as expand from './expand';

export const directiveFor = (args: AST.Node[]): AST.Directive => {
  return {
    type: 'directive',
    args: ['directive', ...args],
  };
};

export const testGetValue = async (
  getValue: Directive['getValue'],
  ...args: AST.Node[]
) => {
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

  return expand.getValue(root, realm, getValue, args);
};

export const testGetType = (
  getType: Directive['getType'],
  ...args: AST.Node[]
) => {
  return expand.getType(directiveFor(args), makeContext(), getType, args);
};
