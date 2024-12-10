// eslint-disable-next-line no-restricted-imports
import Fraction, { F, isFractionLike } from '../../fraction/src';
import type {
  DeciNumber as TDeciNumber,
  DeciNumberInput,
  DeciNumberInputWithNumerator,
  UndefinableOrInfiniteOrFractionLike,
} from './types';

export type { DeciNumberInputWithNumerator };

export const isUndefined = (n: unknown): boolean => {
  return n instanceof DeciNumber && n.n == null && n.d == null && n.s == null;
};

export const isFinite = (n: unknown): boolean => {
  return n instanceof DeciNumber && !isUndefined(n) && !isInfinite(n);
};

export const isInfinite = (n: unknown): boolean =>
  n instanceof DeciNumber && !!(n as unknown as TDeciNumber).infinite;

const isSameInfinite = (a: TDeciNumber, b: TDeciNumber): boolean => {
  return a.s === b.s;
};

const isZero = (n: TDeciNumber | Fraction): boolean =>
  isFinite(n) && n.n === 0n;

export type BinOpOp<B> = (this: Fraction, that: B) => Fraction;

const binOp = <B>(
  a: TDeciNumber,
  b: TDeciNumber | B,
  op: BinOpOp<B>
): TDeciNumber => {
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
): TDeciNumber => {
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

export const N = fromNumber;

export class DeciNumber implements TDeciNumber {
  public readonly n: bigint | undefined;
  public readonly d: bigint | undefined;
  public readonly s: bigint | undefined;
  public infinite = false;

  // eslint-disable-next-line complexity
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
      if (typeof f === 'string') {
        // HACK: remove commas
        f = f.replaceAll(',', '');
      }
      const n = F(f as number | string | bigint);
      this.n = n.n as bigint;
      this.d = n.d as bigint;
      this.s = n.s as bigint;
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
      this.n = fraction.n as bigint;
      this.d = fraction.d as bigint;
      this.s = fraction.s as bigint;
    } else {
      this.s = BigInt(Number(ff.s ?? 1));
      this.infinite = !!ff.infinite;
    }
  }

  public abs(): TDeciNumber {
    if (isUndefined(this) || isInfinite(this)) {
      return this;
    }
    return fromNumber(Fraction.prototype.abs.call(this));
  }

  neg(): TDeciNumber {
    if (isUndefined(this)) {
      return this;
    }
    if (isInfinite(this)) {
      return new DeciNumber({
        infinite: true,
        s: this.s && -this.s,
      });
    }
    return fromNumber(Fraction.prototype.neg.call(this));
  }

  add(n: TDeciNumber): TDeciNumber {
    return binOp(this, n, Fraction.prototype.add);
  }

  sub(n: TDeciNumber): TDeciNumber {
    return binOp(this, n, Fraction.prototype.sub);
  }

  mul(n: TDeciNumber): TDeciNumber {
    return binOp(this, n, Fraction.prototype.mul);
  }

  div(d: TDeciNumber): TDeciNumber {
    if (isFinite(d) && isZero(d)) {
      if (isFinite(this) && isZero(this)) {
        // 0 / 0 = undefined
        return new DeciNumber({
          n: undefined,
          d: undefined,
          s: (this.s ?? 0n) * (d.s ?? 0n),
          infinite: false,
        });
      }

      // n / 0 = infinity
      return new DeciNumber({
        n: undefined,
        d: undefined,
        s: (this.s ?? 0n) * (d.s ?? 0n),
        infinite: true,
      });
    }
    if (isInfinite(this) && isFinite(d)) {
      return new DeciNumber({
        n: undefined,
        d: undefined,
        s: (this.s ?? 0n) * (d.s ?? 0n),
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

  public excelLikeRound(n?: number) {
    const nr = n || 0;
    const powPart = F(10).pow(F(nr));
    const roundResult = this.mul(powPart as unknown as TDeciNumber);
    return Fraction.prototype.round
      .call(roundResult, 0)
      .div(powPart) as unknown as TDeciNumber;
  }

  internalPow(b: TDeciNumber): Fraction {
    let result: Fraction | undefined;
    if (b.compare(ZERO) < 0) {
      return this.internalPow(b.neg()).inverse();
    }
    if (b.d === 1n) {
      result = Fraction.prototype.pow.call(
        this as unknown as Fraction,
        b as unknown as Fraction
      );
    }
    if (result == null || isZero(result)) {
      const resultNumber = this.valueOf() ** b.valueOf();
      if (Number.isNaN(resultNumber)) {
        throw new TypeError(
          `**: result of raising ${this.valueOf()} to ${b.valueOf()} is not rational`
        );
      }
      return N(resultNumber) as unknown as Fraction;
    }
    return result as unknown as Fraction;
  }

  pow(n: TDeciNumber): TDeciNumber {
    return binOp(this, n, DeciNumber.prototype.internalPow);
  }

  gcd(n: TDeciNumber): TDeciNumber {
    return binOp(this, n, Fraction.prototype.gcd);
  }

  lcm(n: TDeciNumber): TDeciNumber {
    return binOp(this, n, Fraction.prototype.lcm);
  }

  mod(n: TDeciNumber | number): TDeciNumber {
    return binOp(this, n, Fraction.prototype.mod);
  }

  ceil(n?: TDeciNumber | number): TDeciNumber {
    return binOp(this, n, Fraction.prototype.ceil);
  }

  floor(n?: TDeciNumber | number): TDeciNumber {
    return binOp(this, n, Fraction.prototype.floor);
  }

  round(n?: TDeciNumber | number): TDeciNumber {
    return binOp(
      this,
      n,
      DeciNumber.prototype.excelLikeRound as unknown as BinOpOp<
        number | TDeciNumber | undefined
      >
    );
  }

  inverse(): TDeciNumber {
    return binOp(this, undefined, Fraction.prototype.inverse);
  }

  simplify(eps?: number): TDeciNumber {
    return binOp(this, eps, Fraction.prototype.simplify);
  }

  compare(that: TDeciNumber): number {
    const a = isFinite(this)
      ? this
      : ZERO.mul(
          typeof this.s === 'number' || typeof this.s === 'bigint'
            ? N(this.s)
            : N(1)
        );
    const b = isFinite(that)
      ? (that as unknown as Fraction)
      : (ZERO as unknown as Fraction);

    return Fraction.prototype.compare.call(a, b);
  }

  equals(that: TDeciNumber): boolean {
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

  divisible(that: TDeciNumber): boolean {
    return (
      isFinite(this) &&
      isFinite(that) &&
      Fraction.prototype.divisible.call(this, that as unknown as Fraction)
    );
  }

  //
  // calling this function can be unprecise in very large numbers
  // do not call valueOf() unless for user presentation of calculation results
  // never for the operations, use fractions for that.
  //
  // use something like `safeNumberForPrecision` if possible
  //
  valueOf(): number {
    if (isUndefined(this)) {
      return NaN;
    }
    if (isInfinite(this)) {
      if ((this.s ?? 0n) < 0) {
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
      return `${(this.s ?? 0n) < 0 ? '-' : ''}∞`;
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

  toContinued(): (number | bigint)[] {
    if (isUndefined(this)) {
      return [];
    }
    if (isInfinite(this)) {
      return [Number(this.s) * Infinity, 1];
    }
    return Fraction.prototype.toContinued.call(this) as bigint[];
  }

  clone(): TDeciNumber {
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
export const UNKNOWN_ASSTRING = '—';
