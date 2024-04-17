// eslint-disable-next-line no-restricted-imports
import type { AST, Type, Value } from '@decipad/language-types';
import { directives } from './directives';
import type { TRealm } from '../scopedRealm';

export const expandDirectiveToType = async (
  realm: TRealm,
  root: AST.Directive
): Promise<Type> => directives[root.args[0]].getType(realm, root);

export const expandDirectiveToValue = async (
  realm: TRealm,
  root: AST.Directive
): Promise<Value.Value> => directives[root.args[0]].getValue(realm, root);
