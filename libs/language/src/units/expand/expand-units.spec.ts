import { F, U, u } from '../../utils';
import { expandUnits } from '.';

describe('expand', () => {
  it('expands unknown unit to the same unit and value', () => {
    const [resultUnits, convert] = expandUnits(U('bananas', { known: false }));
    expect(resultUnits).toMatchObject(U('bananas', { known: false }));
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('converts to base unit on expansionless unit', () => {
    const [resultUnits, convert] = expandUnits(U('inches'));
    expect(resultUnits).toMatchObject(U('meters'));
    expect(convert(F(13))).toMatchObject(F(1651, 5000));
  });

  it('expands known unit to the same unit and value', () => {
    const [resultUnits, convert] = expandUnits(U('watts'));
    expect(resultUnits).toMatchObject(
      U([u('grams'), u('meters', { exp: F(2) }), u('seconds', { exp: F(-3) })])
    );
    expect(convert(F(2))).toMatchObject(F(2000));
  });

  it('expands known unit to the same unit and value (2)', () => {
    const [resultUnits, convert] = expandUnits(U('watts'));
    expect(resultUnits).toMatchObject(
      U([u('grams'), u('meters', { exp: F(2) }), u('seconds', { exp: F(-3) })])
    );
    expect(convert(F(2))).toMatchObject(F(2000));
  });

  it('expands 1 lm === 1 cd⋅sr', () => {
    const [resultUnits, convert] = expandUnits(U('lumens'));
    expect(resultUnits).toMatchObject(
      U([u('candelas', { exp: F(1) }), u('steradians', { exp: F(1) })])
    );
    expect(convert(F(1))).toMatchObject(F(1));
  });

  it('expands 18 kph === 5 m/s', () => {
    const [resultUnits, convert] = expandUnits(U('kph'));
    expect(resultUnits).toMatchObject(
      U([u('meters', { exp: F(1) }), u('seconds', { exp: F(-1) })])
    );
    expect(convert(F(18))).toMatchObject(F(5));
  });

  it('expands electrical resistance units', () => {
    const [resultUnits, convert] = expandUnits(U('ohm'));
    expect(resultUnits).toMatchObject(
      U([
        u('amperes', { exp: F(-2) }),
        u('grams'),
        u('meters', { exp: F(2) }),
        u('seconds', { exp: F(-3) }),
      ])
    );
    expect(convert(F(1))).toMatchObject(F(1000));
  });

  it('expands electrical conductance units', () => {
    const [resultUnits, convert] = expandUnits(U('siemens'));
    expect(resultUnits).toMatchObject(
      U([
        u('amperes', { exp: F(2) }),
        u('grams', { exp: F(-1) }),
        u('meters', { exp: F(-2) }),
        u('seconds', { exp: F(3) }),
      ])
    );
    expect(convert(F(1))).toMatchObject(F(1, 1000));
  });

  it('expands known negative exp unit to the same unit and value (2)', () => {
    const [resultUnits, convert] = expandUnits(U('second', { exp: F(-1) }));
    expect(resultUnits).toMatchObject(U('seconds', { exp: F(-1) }));
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('expands known and unknown negative exp units to the same units and value (1)', () => {
    const [resultUnits, convert] = expandUnits(
      U([u('bananas'), u('second', { exp: F(-1) })])
    );
    expect(resultUnits).toMatchObject(
      U([u('bananas'), u('seconds', { exp: F(-1) })])
    );
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('expands known and unknown negative exp units to the same units and value (2)', () => {
    const [resultUnits, convert] = expandUnits(
      U([u('bananas'), u('second', { exp: F(-1) })])
    );
    expect(resultUnits).toMatchObject(
      U([u('bananas'), u('seconds', { exp: F(-1) })])
    );
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('expands known exp units to the same units and value', () => {
    const [resultUnits, convert] = expandUnits(
      U([
        u('watt'), // grams.m^2.s^-3
        u('hour'),
      ])
    );
    expect(resultUnits).toMatchObject(
      U([u('grams'), u('meters', { exp: F(2) }), u('seconds', { exp: F(-2) })])
    );
    expect(convert(F(2))).toMatchObject(F(2000 * 3600));
  });

  it('expands unknown unit with exp and multiplier to the same units and value', () => {
    const [resultUnits, convert] = expandUnits(U('bananas', { exp: F(2) }));
    expect(resultUnits).toMatchObject(U('bananas', { exp: F(2) }));
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('expands known unit with exp and multiplier to the same units and value', () => {
    const [resultUnits, convert] = expandUnits(U([u('meters', { exp: F(2) })]));
    expect(resultUnits).toMatchObject(U('meters', { exp: F(2) }));
    expect(convert(F(2))).toMatchObject(F(2));
  });

  it('expands standard known unit to the correct units', () => {
    const [resultUnits, convert] = expandUnits(U('calories'));

    expect(resultUnits).toMatchObject(
      U([
        u('grams', { exp: F(1) }),
        u('meters', { exp: F(2) }),
        u('seconds', { exp: F(-2) }),
      ])
    );
    expect(convert(F(2))).toMatchObject(F(8368));
  });

  it('expands standard known unit positive exponent and multiplier to the correct unit', () => {
    const [resultUnits, convert] = expandUnits(U('calories', { exp: F(2) }));

    expect(resultUnits).toMatchObject(
      U([
        u('grams', { exp: F(2) }),
        u('meters', { exp: F(4) }),
        u('seconds', { exp: F(-4) }),
      ])
    );
    expect(convert(F(2))).toMatchObject(F(35011712));
  });

  it('expands non-scalar unit', () => {
    const [resultUnits, convert] = expandUnits(U('celsius'));
    expect(resultUnits).toMatchObject(U('kelvins'));
    expect(convert(F(2))).toMatchObject(F(27515, 100));
  });
});
