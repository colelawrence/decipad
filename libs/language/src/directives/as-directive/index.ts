import { AST } from '@decipad/language-interfaces';
import { DirectiveImpl } from '../types';
import { getValue } from './as-directive-value';
import { getType } from './as-directive-type';

export const as: DirectiveImpl<AST.AsDirective> = {
  getType,
  getValue,
};
