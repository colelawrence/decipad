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
  if (isFractionLike(n)) {
    return new Fraction(n.s * n.n, n.d);
  }
  return new Fraction(n);
};

export default Fraction;

const toFraction = from;

export { from, toFraction };

export const ZERO = from(0);
export const ONE = from(1);

export const F = (n: number | bigint | FractionLike): Fraction => from(n);

export * from './utils';
export * from './isFractionLike';
export * from './min';
export * from './max';
export * from './comparisons';
