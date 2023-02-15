import { AST } from '../parser';
import { build as t, InferError } from '../type';
import { DirectiveImpl } from './types';

export const select: DirectiveImpl<AST.SelectDirective> = {
  async getType() {
    return t.impossible(InferError.retiredFeature('select'));
  },
  async getValue() {
    throw new Error('unreachable');
  },
};
