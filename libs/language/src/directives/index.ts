// eslint-disable-next-line no-restricted-imports
import type { AST, Type, Value } from '@decipad/language-types';
import type { Realm } from '../interpreter';

import { directives } from './directives';

export const expandDirectiveToType = async (
  realm: Realm,
  root: AST.Directive
): Promise<Type> => directives[root.args[0]].getType(realm, root);

export const expandDirectiveToValue = async (
  realm: Realm,
  root: AST.Directive
): Promise<Value.Value> => directives[root.args[0]].getValue(realm, root);
