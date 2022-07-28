import FFraction from 'fraction.js/bigfraction';

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
  function toJSON() {
    return this.toString();
  };

/* eslint-disable */
(FFraction as any).prototype[Symbol.for('nodejs.util.inspect.custom')] =
  function stringifyFractionForNodeConsole(_depth: any, options: any) {
    return `Fraction { ${options.stylize(this.toString(), 'number')} }`;
  };

export default FFraction;

export type FractionLike = {
  n: bigint;
  d: bigint;
  s: bigint;
};

export * from './utils';
export * from './min';
export * from './max';
