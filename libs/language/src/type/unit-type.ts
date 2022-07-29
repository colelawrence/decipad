import Fraction, { FractionLike } from '@decipad/fraction';
import { BaseQuantity } from '../units';

export interface TUnit<TNumberType = Fraction> {
  pretty?: 'string';
  unit: string;
  exp: TNumberType;
  multiplier: TNumberType;
  known: boolean;
  aliasFor?: TUnits<TNumberType>;
  enforceMultiplier?: boolean;
  quality?: string;
  baseQuantity?: BaseQuantity;
  baseSuperQuantity?: BaseQuantity | 'currency';
}

export interface TUnits<TNumberType = Fraction> {
  type: 'units';
  args: TUnit<TNumberType>[];
}

export type Units = TUnits<Fraction>;
export type Unit = TUnit<Fraction>;

export type FUnits = TUnits<FractionLike>;
export type FUnit = TUnit<FractionLike>;

export const units = <TF>(...args: TUnit<TF>[]): TUnits<TF> => {
  return {
    type: 'units',
    args,
  };
};
