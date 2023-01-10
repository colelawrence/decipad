import Fraction from 'fraction.js/bigfraction';
import { FractionLike, isFractionLike } from './isFractionLike';

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
  function toJSON() {
    return this.toString();
  };

/* eslint-disable */
(Fraction as any).prototype[Symbol.for('nodejs.util.inspect.custom')] =
  function stringifyFractionForNodeConsole(_depth: any, options: any) {
    return `Fraction { ${options.stylize(this.toString(), 'number')} }`;
  };

const isNumber = (n: unknown): n is number | bigint => {
  const tof = typeof n;
  return tof === 'number' || tof === 'bigint';
};

export const abs = <N extends number | bigint>(n: N): N => {
  if (typeof n === 'number') {
    return Math.abs(n) as N;
  }
  if (n < 0n) {
    return -n as N;
  }
  return n;
};

const from = (
  n: Fraction | FractionLike | number | string | bigint,
  d?: bigint | number
): Fraction => {
  if (d != null) {
    return from(n).div(from(d));
  }
  if (n instanceof Fraction) {
    return n;
  }
  if (typeof n === 'string') {
    return new Fraction(n);
  }
  if (
    isFractionLike(n) &&
    isNumber(n.s) &&
    isNumber(n.n) &&
    (n.d === undefined || isNumber(n.d))
  ) {
    return new Fraction(BigInt(n.s) * BigInt(n.n), n.d);
  }
  return new Fraction(n as number | bigint | string);
};

export default Fraction;

const toFraction = from;

export { from, toFraction };

export const ZERO = from(0);
export const ONE = from(1);

export const F = (n: number | bigint | FractionLike | string): Fraction =>
  from(n);

export * from './utils';
export * from './isFractionLike';
export * from './min';
export * from './max';
export * from './comparisons';
