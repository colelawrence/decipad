import DeciNumber from '@decipad/number';
import { BaseQuantity } from '../units';

export interface Unit {
  pretty?: 'string';
  unit: string;
  exp: DeciNumber;
  multiplier: DeciNumber;
  known: boolean;
  aliasFor?: Unit[];
  enforceMultiplier?: boolean;
  quality?: string;
  baseQuantity?: BaseQuantity;
  baseSuperQuantity?: BaseQuantity | 'currency';
}
