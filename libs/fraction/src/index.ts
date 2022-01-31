import Fraction from 'fraction.js/bigfraction';

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
  function toJSON() {
    return this.toString();
  };

/* eslint-disable */
(Fraction as any).prototype[Symbol.for('nodejs.util.inspect.custom')] =
  function stringifyFractionForNodeConsole(_depth: any, options: any) {
    return `Fraction { ${options.stylize(this.toString(), 'number')} }`;
  };

export default Fraction;
