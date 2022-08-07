import Fraction from '@decipad/fraction';
import { BaseQuantity } from '../units';

export interface Unit {
  pretty?: 'string';
  unit: string;
  exp: Fraction;
  multiplier: Fraction;
  known: boolean;
  aliasFor?: Units;
  enforceMultiplier?: boolean;
  quality?: string;
  baseQuantity?: BaseQuantity;
  baseSuperQuantity?: BaseQuantity | 'currency';
}

export interface Units {
  type: 'units';
  args: Unit[];
}

export const units = (...args: Unit[]): Units => ({ type: 'units', args });
