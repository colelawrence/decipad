import Fraction from '.';

describe('fraction supports bigint', () => {
  it('handles big division', () => {
    const big = new Fraction(10).pow(2000);
    const small = new Fraction(10).pow(-2000);
    expect(big.mul(small)).toStrictEqual(new Fraction(1));
  });
});
