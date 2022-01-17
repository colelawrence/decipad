import Fraction from '@decipad/fraction';

export interface Unit<TNumberType = Fraction> {
  unit: string;
  exp: TNumberType;
  multiplier: TNumberType;
  known: boolean;
  aliasFor?: Units;
}

export interface Units<TNumberType = Fraction> {
  type: 'units';
  args: Unit<TNumberType>[];
}

export const units = (...args: Unit[]): Units => {
  return {
    type: 'units',
    args,
  };
};
