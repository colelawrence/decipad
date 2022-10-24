import Fraction from '@decipad/fraction';
import { inf, minusInf } from './consts';

export interface ToStringable {
  toString: () => string;
}

export type Infinity = typeof inf | typeof minusInf;

export type LogicNumber = Fraction | Infinity;
