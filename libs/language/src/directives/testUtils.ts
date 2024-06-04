import type { AST, Type, Value } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { buildType as t } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { isExpression, isNode } from '@decipad/language-utils';
import { inferExpression } from '../infer';
import type { DirectiveImpl } from './types';
import type { TRealm } from '../scopedRealm';
import { ScopedRealm, makeInferContext } from '../scopedRealm';

export const directiveFor = (args: AST.Node[]): AST.Directive => {
  return {
    type: 'directive',
    args: ['directive', ...args],
  };
};

export const testGetValue = async (
  getValue: DirectiveImpl['getValue'],
  args: AST.Node[],
  _realm?: TRealm
): Promise<Value.Value> => {
  const realm = _realm || new ScopedRealm(undefined, makeInferContext());
  const root = directiveFor(args);
  root.inferredType = t.number();

  // Preload passed arguments into ctx.nodeTypes
  for (const passedArg of args) {
    if (isExpression(passedArg)) {
      // eslint-disable-next-line no-await-in-loop
      await inferExpression(realm, passedArg);
    }
  }

  return getValue(realm, root);
};

export const testGetType = async (
  getType: DirectiveImpl['getType'],
  ...args: [TRealm | AST.Node, ...AST.Node[]]
): Promise<Type> => {
  // Allow passing a context along with the args, it's useful for testing
  const [firstArg, ...restArgs] = args;
  const realm = isNode(firstArg)
    ? new ScopedRealm(undefined, makeInferContext())
    : firstArg;
  const argsWithoutCtx = isNode(firstArg) ? [firstArg, ...restArgs] : restArgs;

  return getType(realm, directiveFor(argsWithoutCtx));
};
