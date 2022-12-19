import { build as t, InferError } from '../type';
import { Directive } from './types';

export const select: Directive = {
  argCount: 2,
  async getType() {
    return t.impossible(InferError.retiredFeature('select'));
  },
  async getValue() {
    throw new Error('unreachable');
  },
};
