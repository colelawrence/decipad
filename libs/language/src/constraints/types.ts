// eslint-disable-next-line no-restricted-imports
import DeciNumber from '@decipad/number';
import { inf, minusInf } from './consts';

export interface ToStringable {
  toString: () => string;
}

export type Infinity = typeof inf | typeof minusInf;

export type LogicNumber = DeciNumber | Infinity;
