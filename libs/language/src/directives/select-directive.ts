// eslint-disable-next-line no-restricted-imports
import { buildType as t, InferError, AST } from '@decipad/language-types';
import { DirectiveImpl } from './types';

export const select: DirectiveImpl<AST.SelectDirective> = {
  getType() {
    return t.impossible(InferError.retiredFeature('select'));
  },
  getValue() {
    throw new Error('unreachable');
  },
};
