import Fraction from '@decipad/fraction';
import { BaseQuantity } from '../units';

export interface Unit {
  pretty?: 'string';
  unit: string;
  exp: Fraction;
  multiplier: Fraction;
  known: boolean;
  aliasFor?: Unit[];
  enforceMultiplier?: boolean;
  quality?: string;
  baseQuantity?: BaseQuantity;
  baseSuperQuantity?: BaseQuantity | 'currency';
}

// TODO remove
export const units = (...args: Unit[]): Unit[] => args;
