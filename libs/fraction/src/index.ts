import Fraction from 'fraction.js/bigfraction';

// needed because JSON.stringify(BigInt) does not work
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
  function toJSON() {
    return this.toString();
  };

export default Fraction;
