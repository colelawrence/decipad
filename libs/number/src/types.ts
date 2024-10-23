// eslint-disable-next-line no-restricted-imports
import type Fraction from '@decipad/fraction';
// eslint-disable-next-line no-restricted-imports
import { type FractionLike } from '@decipad/fraction';

export interface DeciNumberBase {
  d: undefined | bigint;
  n: undefined | bigint;
  s: undefined | bigint;
  infinite: boolean;

  abs(): DeciNumberBase;
  neg(): DeciNumberBase;

  add(n: DeciNumberBase): DeciNumberBase;
  sub(n: DeciNumberBase): DeciNumberBase;
  mul(n: DeciNumberBase): DeciNumberBase;
  div(n: DeciNumberBase): DeciNumberBase;
  pow(n: DeciNumberBase): DeciNumberBase;
  internalPow(b: DeciNumberBase): Fraction;
  gcd(n: DeciNumberBase): DeciNumberBase;
  lcm(n: DeciNumberBase): DeciNumberBase;

  mod(n?: number | string | DeciNumberBase): DeciNumberBase;

  ceil(places?: number | DeciNumberBase): DeciNumberBase;
  floor(places?: number | DeciNumberBase): DeciNumberBase;
  round(places?: number | DeciNumberBase): DeciNumberBase;
  excelLikeRound(places?: number): DeciNumberBase;

  inverse(): DeciNumberBase;

  simplify(eps?: number): DeciNumberBase;

  equals(n: number | string | DeciNumberBase): boolean;
  compare(n: number | string | DeciNumberBase): number;
  divisible(n: number | string | DeciNumberBase): boolean;

  valueOf(): number;
  toString(decimalPlaces?: number): string;
  toLatex(excludeWhole?: boolean): string;
  toFraction(excludeWhole?: boolean): string;
  toContinued(): (number | bigint)[];
  clone(): DeciNumberBase;

  isZero(): boolean;
}

export type DeciNumber = DeciNumberBase;

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
