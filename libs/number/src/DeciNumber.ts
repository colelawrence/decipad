// eslint-disable-next-line no-restricted-imports
import Fraction, { F, isFractionLike } from '../../fraction/src';
import {
  DeciNumberInput,
  DeciNumberInputWithNumerator,
  FiniteNumber,
  InfiniteNumber,
  UndefinableOrInfiniteOrFractionLike,
  UndefinedNumber,
} from './types';

export type { DeciNumberInputWithNumerator };

export const isUndefined = (n: unknown): n is UndefinedNumber => {
  return n instanceof DeciNumber && n.n == null && n.d == null && n.s == null;
};

export const isFinite = (n: unknown): n is FiniteNumber => {
  return n instanceof DeciNumber && !isUndefined(n) && !isInfinite(n);
};

export const isInfinite = (n: unknown): n is InfiniteNumber =>
  n instanceof DeciNumber && !!(n as DeciNumber).infinite;

const isSameInfinite = (a: InfiniteNumber, b: InfiniteNumber): boolean => {
  return a.s === b.s;
};

const isZero = (n: DeciNumber | Fraction): boolean => isFinite(n) && n.n === 0n;

const binOp = <B>(
  a: DeciNumber,
  b: DeciNumber | B,
  op: (this: Fraction, that: B) => Fraction
): DeciNumber => {
  if (isUndefined(a) || isInfinite(a)) {
    return a;
  }
  if (b instanceof DeciNumber && (isUndefined(b) || isInfinite(b))) {
    return b;
  }
  const result = op.call(a as unknown as Fraction, b as B);
  return fromNumber(result);
};

export const isDeciNumberInput = (n: unknown): n is DeciNumberInput => {
  return (
    typeof n === 'bigint' ||
    (typeof n === 'object' &&
      n != null &&
      (n instanceof DeciNumber ||
        ('n' in n &&
          (typeof n.n === 'number' ||
            typeof n.n === 'bigint' ||
            typeof n.n === 'string')) ||
        ('infinite' in n && typeof n.infinite === 'boolean')))
  );
};

export const fromNumber = (
  n: unknown,
  d?: number | bigint | string
): DeciNumber => {
  if (n == null) {
    return new DeciNumber({});
  }
  if (n instanceof DeciNumber) {
    if (d == null) {
      return n;
    }
    return n.div(fromNumber(d));
  }

  const tofN = typeof n;
  if (tofN === 'number' || tofN === 'bigint' || tofN === 'string') {
    if (d == null) {
      return new DeciNumber(n);
    } else {
      return fromNumber(n).div(fromNumber(d));
    }
  }
  if (isFractionLike(n) || isDeciNumberInput(n)) {
    return new DeciNumber(n);
  }

  throw new Error(`Could not convert ${n} of type ${typeof n} to number`);
};

export const pow = (a: DeciNumber, b: DeciNumber): Fraction => {
  const result = N(
    Fraction.prototype.pow.call(
      a as unknown as Fraction,
      b as unknown as Fraction
    )
  );
  if (result == null || isZero(result)) {
    const resultNumber = a.valueOf() ** b.valueOf();
    if (Number.isNaN(resultNumber)) {
      throw new TypeError(
        `**: result of raising to ${b.toString()} is not rational`
      );
    }
    return N(resultNumber) as unknown as Fraction;
  }
  return result as unknown as Fraction;
};

export const N = fromNumber;

export class DeciNumber {
  public readonly n?: bigint;
  public readonly d?: bigint;
  public readonly s?: bigint;
  public infinite = false;

  constructor(
    f?: UndefinableOrInfiniteOrFractionLike | string | bigint | number
  ) {
    if (f == null) {
      return;
    }
    const tof = typeof f;
    if (tof === 'number') {
      if (Number.isNaN(f)) {
        return;
      }
      if (!Number.isFinite(f)) {
        this.s = BigInt(Math.sign(f as number));
        this.infinite = true;
        return;
      }
    }
    if (tof === 'number' || tof === 'string' || tof === 'bigint') {
      const n = F(f as number | string | bigint);
      this.n = n.n;
      this.d = n.d;
      this.s = n.s;
      return;
    }
    const ff = f as UndefinableOrInfiniteOrFractionLike;
    if (ff.d == null && ff.n == null && !ff.infinite) {
      return;
    }
    if (typeof ff.n === 'number' && !Number.isFinite(ff.n)) {
      if (Number.isNaN(ff.n)) {
        return;
      }
      if (Number.isFinite(ff.d)) {
        this.infinite = true;
        this.s = ff.s != null ? BigInt(ff.s) : 1n;
      }
      return;
    }
    if (typeof ff.d === 'number' && !Number.isFinite(ff.d)) {
      this.n = 0n;
      this.d = 1n;
      this.s = BigInt(Math.sign(Number(ff.n)) * Math.sign(Number(ff.d)));
      return;
    }

    if (!ff.d) {
      if (ff.n) {
        this.infinite = true;
        this.s = BigInt(Math.sign(Number(ff.n)) * Math.sign(Number(ff.d)));
        return;
      } else if (!ff.infinite) {
        return;
      }
    }

    if (isFractionLike(ff)) {
      const fraction = F(ff);
      this.n = fraction.n;
      this.d = fraction.d;
      this.s = fraction.s;
    } else {
      this.s = BigInt(Number(ff.s ?? 1));
      this.infinite = !!ff.infinite;
    }
  }

  public abs(): DeciNumber {
    if (isUndefined(this) || isInfinite(this)) {
      return this;
    }
    return fromNumber(Fraction.prototype.abs.call(this));
  }

  neg(): DeciNumber {
    if (isUndefined(this)) {
      return this;
    }
    if (isInfinite(this)) {
      return new DeciNumber({
        infinite: true,
        s: -this.s,
      });
    }
    return fromNumber(Fraction.prototype.neg.call(this));
  }

  add(n: DeciNumber): DeciNumber {
    return binOp(this, n, Fraction.prototype.add);
  }

  sub(n: DeciNumber): DeciNumber {
    return binOp(this, n, Fraction.prototype.sub);
  }

  mul(n: DeciNumber): DeciNumber {
    return binOp(this, n, Fraction.prototype.mul);
  }

  div(d: DeciNumber): DeciNumber {
    if (isFinite(d) && isZero(d)) {
      if (isFinite(this) && isZero(this)) {
        // 0 / 0 = undefined
        return new DeciNumber({
          n: undefined,
          d: undefined,
          s: this.s ?? 0n * d.s,
          infinite: false,
        });
      }
      // n / 0 = infinity
      return new DeciNumber({
        n: undefined,
        d: undefined,
        s: this.s ?? 0n * d.s,
        infinite: true,
      });
    }
    if (isInfinite(this) && isFinite(d)) {
      return new DeciNumber({
        n: undefined,
        d: undefined,
        s: this.s ?? 0n * d.s,
        infinite: true,
      });
    }
    if (isInfinite(d)) {
      if (isFinite(this)) {
        return ZERO;
      } else {
        return new DeciNumber({});
      }
    }
    return binOp(this, d, Fraction.prototype.div);
  }

  private excelLikeRound(n?: number) {
    const nr = n || 0;
    const powPart = F(10).pow(F(nr));
    const roundResult = this.mul(powPart as unknown as DeciNumber);
    return Fraction.prototype.round.call(roundResult, 0).div(powPart);
  }

  private internalPow(b: DeciNumber) {
    const result = Fraction.prototype.pow.call(
      this as unknown as Fraction,
      b as unknown as Fraction
    );
    if (result == null || isZero(result)) {
      const resultNumber = this.valueOf() ** b.valueOf();
      if (Number.isNaN(resultNumber)) {
        throw new TypeError(
          `**: result of raising to ${b.toString()} is not rational`
        );
      }
      return N(resultNumber) as unknown as Fraction;
    }
    return result as unknown as Fraction;
  }

  pow(n: DeciNumber): DeciNumber {
    return binOp(this, n, DeciNumber.prototype.internalPow);
  }

  gcd(n: DeciNumber): DeciNumber {
    return binOp(this, n, Fraction.prototype.gcd);
  }

  lcm(n: DeciNumber): DeciNumber {
    return binOp(this, n, Fraction.prototype.lcm);
  }

  mod(n: DeciNumber | number): DeciNumber {
    return binOp(this, n, Fraction.prototype.mod);
  }

  ceil(n?: DeciNumber | number): DeciNumber {
    return binOp(this, n, Fraction.prototype.ceil);
  }

  floor(n?: DeciNumber | number): DeciNumber {
    return binOp(this, n, Fraction.prototype.floor);
  }

  round(n?: DeciNumber | number): DeciNumber {
    return binOp(this, n, DeciNumber.prototype.excelLikeRound);
  }

  inverse(): DeciNumber {
    return binOp(this, undefined, Fraction.prototype.inverse);
  }

  simplify(eps?: number): DeciNumber {
    return binOp(this, eps, Fraction.prototype.simplify);
  }

  compare(that: DeciNumber): number {
    const a = isFinite(this)
      ? this
      : ZERO.mul(
          typeof this.s === 'number' || typeof this.s === 'bigint'
            ? N(this.s)
            : N(1)
        );
    const b = isFinite(that)
      ? (that as Fraction)
      : (ZERO as unknown as Fraction);

    return Fraction.prototype.compare.call(a, b);
  }

  equals(that: DeciNumber): boolean {
    if (isUndefined(this) || isUndefined(that)) {
      return isUndefined(this) && isUndefined(that);
    }
    if (isInfinite(this) || isInfinite(that)) {
      return (
        (isInfinite(this) && isInfinite(that) && isSameInfinite(this, that)) ||
        false
      );
    }
    return Fraction.prototype.equals.call(this, that as unknown as Fraction);
  }

  divisible(that: DeciNumber): boolean {
    return (
      isFinite(this) &&
      isFinite(that) &&
      Fraction.prototype.divisible.call(this, that)
    );
  }

  valueOf(): number {
    if (isUndefined(this)) {
      return NaN;
    }
    if (isInfinite(this)) {
      if (this.s < 0) {
        return -Infinity;
      }
      return Infinity;
    }
    return Fraction.prototype.valueOf.call(this);
  }

  toString(decimalPlaces?: number): string {
    if (isUndefined(this)) {
      return UNKNOWN_ASSTRING;
    }
    if (isInfinite(this)) {
      return `${this.s < 0 ? '-' : ''}∞`;
    }
    return Fraction.prototype.toString.call(this, decimalPlaces);
  }

  toLatex(excludeWhole?: boolean): string {
    if (isUndefined(this) || isInfinite(this)) {
      return this.toString();
    }
    return Fraction.prototype.toLatex.call(this, excludeWhole);
  }

  toFraction(excludeWhole?: boolean): string {
    if (isUndefined(this) || isInfinite(this)) {
      return this.toString();
    }
    return Fraction.prototype.toFraction.call(this, excludeWhole);
  }

  toContinued(): number[] {
    if (isUndefined(this)) {
      return [];
    }
    if (isInfinite(this)) {
      return [Number(this.s) * Infinity, 1];
    }
    return Fraction.prototype.toContinued.call(this);
  }

  clone(): DeciNumber {
    return fromNumber(this);
  }

  isZero(): boolean {
    return this.equals(ZERO);
  }

  static undefined() {
    return UNDEFINED;
  }

  static infinite(s: -1 | 1 = 1) {
    return N({ infinite: true, s });
  }
}

export const UNDEFINED = N(undefined);
export const ZERO = N(0);
export const ONE = N(1);
export const TWO = N(2);
export const UNKNOWN_ASSTRING = '?';
