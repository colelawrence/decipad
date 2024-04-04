// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { buildType as t, InferError } from '@decipad/language-types';
import type { DirectiveImpl } from './types';

export const select: DirectiveImpl<AST.SelectDirective> = {
  getType() {
    return t.impossible(InferError.retiredFeature('select'));
  },
  getValue() {
    throw new Error('unreachable');
  },
};
