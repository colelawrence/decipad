// eslint-disable-next-line no-restricted-imports
import Fraction, { FractionLike } from '@decipad/fraction';

export interface DeciNumberBase {
  abs(): DeciNumber;
  neg(): DeciNumber;

  add: DeciNumber;
  sub: DeciNumber;
  mul: DeciNumber;
  div: DeciNumber;
  pow: DeciNumber;
  gcd: DeciNumber;
  lcm: DeciNumber;

  mod(n?: number | string | DeciNumber): DeciNumber;

  ceil(places?: number): DeciNumber;
  floor(places?: number): DeciNumber;
  round(places?: number): DeciNumber;

  inverse(): DeciNumber;

  simplify(eps?: number): DeciNumber;

  equals(n: number | string | DeciNumber): boolean;
  compare(n: number | string | DeciNumber): number;
  divisible(n: number | string | DeciNumber): boolean;

  valueOf(): number;
  toString(decimalPlaces?: number): string;
  toLatex(excludeWhole?: boolean): string;
  toDeciNumber(excludeWhole?: boolean): string;
  toContinued(): number[];
  clone(): DeciNumber;
}

export type FiniteNumber = Fraction & DeciNumberBase;

export type InfiniteNumber = DeciNumberBase & {
  d: undefined;
  n: undefined;
  s: bigint;
  infinite: true;
};

export type UndefinedNumber = DeciNumberBase & {
  d: undefined;
  n: undefined;
  s: undefined;
};

export type DeciNumber = FiniteNumber | InfiniteNumber | UndefinedNumber;

export interface DeciNumberInput {
  n?: FractionLike['n'];
  d?: FractionLike['d'];
  s?: FractionLike['s'];
  infinite?: boolean;
}

export interface DeciNumberInputWithNumerator {
  n: FractionLike['n'];
  d?: FractionLike['d'];
  s?: FractionLike['s'];
  infinite?: boolean;
}

export type UndefinableOrInfiniteOrFractionLike =
  | (FractionLike & {
      infinite?: boolean;
    })
  | DeciNumberInput;
