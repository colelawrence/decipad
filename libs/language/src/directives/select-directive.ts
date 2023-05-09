import { AST } from '../parser';
import { buildType as t, InferError } from '../type';
import { DirectiveImpl } from './types';

export const select: DirectiveImpl<AST.SelectDirective> = {
  getType() {
    return t.impossible(InferError.retiredFeature('select'));
  },
  getValue() {
    throw new Error('unreachable');
  },
};
