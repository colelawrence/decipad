// eslint-disable-next-line no-restricted-imports
import { AST, Type, Value, buildType as t } from '@decipad/language-types';
import { isExpression, isNode } from '../utils';
import { Realm } from '../interpreter';
import { inferExpression, makeContext } from '../infer';
import { DirectiveImpl } from './types';

export const directiveFor = (args: AST.Node[]): AST.Directive => {
  return {
    type: 'directive',
    args: ['directive', ...args],
  };
};

export const testGetValue = async (
  getValue: DirectiveImpl['getValue'],
  args: AST.Node[],
  _realm?: Realm
): Promise<Value.Value> => {
  const realm = _realm || new Realm(makeContext());
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
  ...args: [Realm | AST.Node, ...AST.Node[]]
): Promise<Type> => {
  // Allow passing a context along with the args, it's useful for testing
  const [firstArg, ...restArgs] = args;
  const realm = isNode(firstArg) ? new Realm(makeContext()) : firstArg;
  const argsWithoutCtx = isNode(firstArg) ? [firstArg, ...restArgs] : restArgs;

  return getType(realm, directiveFor(argsWithoutCtx));
};
