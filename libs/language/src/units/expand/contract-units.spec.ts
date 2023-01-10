import { N } from '@decipad/number';
import { U, u } from '../../utils';
import { contractUnits } from '.';

describe('expand', () => {
  it('contracts unknown unit to the same unit and value', () => {
    const [resultUnits, convert] = contractUnits(
      U('bananas', { known: false })
    );
    expect(resultUnits).toMatchObject(U('bananas', { known: false }));
    expect(convert(N(2))).toMatchObject(N(2));
  });

  it('expands and converts from base unit', () => {
    const [resultUnits, convert] = contractUnits(U('inches'));
    expect(resultUnits).toMatchObject(U('inches'));
    expect(convert(N(1651, 5000))).toMatchObject(N(13));
  });

  it('contracts known unit to the same unit and value', () => {
    const [resultUnits, convert] = contractUnits(U('watts'));
    expect(resultUnits).toMatchObject(U('watts'));
    expect(convert(N(2000))).toMatchObject(N(2));
  });

  it('contracts known unit to the same unit and value (2)', () => {
    const [resultUnits, convert] = contractUnits(U('watts'));
    expect(resultUnits).toMatchObject(U('watts'));
    expect(convert(N(2000))).toMatchObject(N(2));
  });

  it('contracts known negative exp unit to the same unit and value (2)', () => {
    const [resultUnits, convert] = contractUnits(U('second', { exp: N(-1) }));
    expect(resultUnits).toMatchObject(U('second', { exp: N(-1) }));
    expect(convert(N(2))).toMatchObject(N(2));
  });

  it('contracts known and unknown negative exp units to the same units and value (1)', () => {
    const [resultUnits, convert] = contractUnits(
      U([u('bananas'), u('second', { exp: N(-1) })])
    );
    expect(resultUnits).toMatchObject(
      U([u('bananas'), u('second', { exp: N(-1) })])
    );
    expect(convert(N(2))).toMatchObject(N(2));
  });

  it('contracts known and unknown negative exp units to the same units and value (2)', () => {
    const [resultUnits, convert] = contractUnits(
      U([u('bananas'), u('second', { exp: N(-1) })])
    );
    expect(resultUnits).toMatchObject(
      U([u('bananas'), u('second', { exp: N(-1) })])
    );
    expect(convert(N(2))).toMatchObject(N(2));
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
    expect(convert(N(2000 * 3600))).toMatchObject(N(2));
  });

  it('contracts unknown unit with exp to the same units and value', () => {
    const [resultUnits, convert] = contractUnits(U('bananas', { exp: N(2) }));
    expect(resultUnits).toMatchObject(U('bananas', { exp: N(2) }));
    expect(convert(N(2))).toMatchObject(N(2));
  });

  it('contracts known unit with exp to the same units and value', () => {
    const [resultUnits, convert] = contractUnits(
      U([u('meters', { exp: N(2) })])
    );
    expect(resultUnits).toMatchObject(U('meters', { exp: N(2) }));
    expect(convert(N(2))).toMatchObject(N(2));
  });

  it('contracts standard known unit to the correct units', () => {
    const [resultUnits, convert] = contractUnits(U('calories'));

    expect(resultUnits).toMatchObject(U('calories'));
    expect(convert(N(8368))).toMatchObject(N(2));
  });

  it('contracts standard known unit positive exponent and multiplier to the correct units', () => {
    const [resultUnits, convert] = contractUnits(U('calories', { exp: N(2) }));

    expect(resultUnits).toMatchObject(U('calories', { exp: N(2) }));
    expect(convert(N(35011712))).toMatchObject(N(2));
  });

  it('contracts non-scalar unit', () => {
    const [resultUnits, convert] = contractUnits(U('celsius'));
    expect(resultUnits).toMatchObject(U('celsius'));
    expect(convert(N(27515, 100))).toMatchObject(N(2));
  });
});
