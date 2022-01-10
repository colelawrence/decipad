import Fraction from '@decipad/fraction';

export interface Unit {
  unit: string;
  exp: bigint;
  multiplier: Fraction;
  known: boolean;
  aliasFor?: Units;
}

export interface Units {
  type: 'units';
  args: Unit[];
}

export const units = (...args: Unit[]): Units => {
  return {
    type: 'units',
    args,
  };
};
