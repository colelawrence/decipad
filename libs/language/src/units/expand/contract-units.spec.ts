import { F, U, u } from '../../utils';
import { contractUnits } from '.';

describe('expand', () => {
  it('contracts unknown unit to the same unit and value', () => {
    const [resultUnits, convert] = contractUnits(
      U('bananas', { known: false })
    );
    expect(resultUnits).toMatchObject(U('bananas', { known: false }));
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('expands and converts from base unit', () => {
    const [resultUnits, convert] = contractUnits(U('inches'));
    expect(resultUnits).toMatchObject(U('inches'));
    expect(convert(F(1651, 5000))).toMatchObject(F(13));
  });

  it('contracts known unit to the same unit and value', () => {
    const [resultUnits, convert] = contractUnits(U('watts'));
    expect(resultUnits).toMatchObject(U('watts'));
    expect(convert(F(2000))).toMatchObject(F(2));
  });

  it('contracts known unit to the same unit and value (2)', () => {
    const [resultUnits, convert] = contractUnits(
      U('watts', { multiplier: 1000 })
    );
    expect(resultUnits).toMatchObject(U('watts', { multiplier: 1000 }));
    expect(convert(F(2000))).toMatchObject(F(2));
  });

  it('contracts known negative exp unit to the same unit and value (2)', () => {
    const [resultUnits, convert] = contractUnits(U('second', { exp: -1 }));
    expect(resultUnits).toMatchObject(U('second', { exp: -1 }));
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('contracts known and unknown negative exp units to the same units and value (1)', () => {
    const [resultUnits, convert] = contractUnits(
      U([u('bananas'), u('second', { exp: -1 })])
    );
    expect(resultUnits).toMatchObject(
      U([u('bananas'), u('second', { exp: -1 })])
    );
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('contracts known and unknown negative exp units to the same units and value (2)', () => {
    const [resultUnits, convert] = contractUnits(
      U([u('bananas'), u('second', { exp: -1, multiplier: 0.001 })])
    );
    expect(resultUnits).toMatchObject(
      U([u('bananas'), u('second', { exp: -1, multiplier: 0.001 })])
    );
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('contracts known exp units to the same units and value', () => {
    const [resultUnits, convert] = contractUnits(
      U([
        u('watt'), // grams.m^2.s^-3
        u('hour'),
      ])
    );
    expect(resultUnits).toMatchObject(
      U([
        u('watt'), // grams.m^2.s^-3
        u('hour'),
      ])
    );
    expect(convert(F(2000 * 3600))).toMatchObject(F(2));
  });

  it('contracts unknown unit with exp and multiplier to the same units and value', () => {
    const [resultUnits, convert] = contractUnits(
      U('bananas', { exp: 2, multiplier: 100 })
    );
    expect(resultUnits).toMatchObject(
      U('bananas', { exp: 2, multiplier: 100 })
    );
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('contracts known unit with exp and multiplier to the same units and value', () => {
    const [resultUnits, convert] = contractUnits(
      U([u('meters', { exp: 2, multiplier: 0.001 })])
    );
    expect(resultUnits).toMatchObject(
      U('meters', { exp: 2, multiplier: 0.001 })
    );
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('contracts standard known unit to the correct units', () => {
    const [resultUnits, convert] = contractUnits(U('calories'));

    expect(resultUnits).toMatchObject(U('calories'));
    expect(convert(F(8368))).toMatchObject(F(2));
  });

  it('contracts standard known unit with multiplier to the correct units', () => {
    const [resultUnits, convert] = contractUnits(
      U('calories', { multiplier: 0.001 })
    );

    expect(resultUnits).toMatchObject(U('calories', { multiplier: 0.001 }));
    expect(convert(F(8368))).toMatchObject(F(2));
  });

  it('contracts standard known unit positive exponent and multiplier to the correct units', () => {
    const [resultUnits, convert] = contractUnits(U('calories', { exp: 2 }));

    expect(resultUnits).toMatchObject(U('calories', { exp: 2 }));
    expect(convert(F(35011712))).toMatchObject(F(2));
  });

  it('contracts non-scalar unit', () => {
    const [resultUnits, convert] = contractUnits(U('celsius'));
    expect(resultUnits).toMatchObject(U('celsius'));
    expect(convert(F(27515, 100))).toMatchObject(F(2));
  });
});
