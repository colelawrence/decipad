import Fraction from '@decipad/fraction';

export interface TUnit<TNumberType = Fraction> {
  unit: string;
  exp: TNumberType;
  multiplier: TNumberType;
  known: boolean;
  aliasFor?: Units;
}

export interface TUnits<TNumberType = Fraction> {
  type: 'units';
  args: TUnit<TNumberType>[];
}

export type Units = TUnits<Fraction>;
export type Unit = TUnit<Fraction>;

export const units = (...args: Unit[]): Units => {
  return {
    type: 'units',
    args,
  };
};
