import type { AST } from '..';
import { isExpression } from '../utils';
import { Realm } from '../interpreter';
import { inferExpression, makeContext } from '../infer';

import { Directive } from './types';
import * as expand from './expand';

export const testGetValue = async (
  getValue: Directive['getValue'],
  ...args: AST.Node[]
) => {
  const ctx = makeContext();
  const realm = new Realm(ctx);

  // Preload passed arguments into ctx.nodeTypes
  for (const passedArg of args) {
    if (isExpression(passedArg)) {
      // eslint-disable-next-line no-await-in-loop
      await inferExpression(ctx, passedArg);
    }
  }

  return expand.getValue(realm, getValue, args);
};

export const testGetType = (
  getType: Directive['getType'],
  ...args: AST.Node[]
) => {
  return expand.getType(makeContext(), getType, args);
};
