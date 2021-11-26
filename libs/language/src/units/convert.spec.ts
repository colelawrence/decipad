import { F, U, u } from '../utils';
import { convertBetweenUnits } from '.';

describe('convert', () => {
  it('throws when from unit is unknown', () => {
    expect(() => convertBetweenUnits(F(1), U('apples'), U('meters'))).toThrow(
      "Don't know how to convert between apples and meters"
    );
  });

  it('throws when to unit is unknown', () => {
    expect(() => convertBetweenUnits(F(1), U('meters'), U('jeeters'))).toThrow(
      "Don't know how to convert between meters and jeeters"
    );
  });

  it('converts between the same unit', () => {
    expect(convertBetweenUnits(F(1), U('meters'), U('meters'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(1), U('meter'), U('meters'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(1), U('meters'), U('meter'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(1), U('meters'), U('m'))).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), U('m'), U('meters'))).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), U('m'), U('metres'))).toMatchObject(F(1));
  });

  it('converts between unknown units if they are the same', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U('bananas', { known: false }),
        U('bananas', { known: false })
      )
    ).toMatchObject(F(2));
  });

  it('throws if units are not of the same base quantity', () => {
    expect(() => convertBetweenUnits(F(1), U('meters'), U('grams'))).toThrow(
      "Don't know how to convert between meters and grams"
    );
  });

  it('converts between length units', () => {
    expect(convertBetweenUnits(F(2), U('meters'), U('inches'))).toMatchObject(
      F(393701, 5000)
    );
    expect(
      convertBetweenUnits(F(78.7402), U('inches'), U('metres'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), U('meter'), U('angstroms'))).toMatchObject(
      F(2e10)
    );
    expect(convertBetweenUnits(F(2e10), U('angstroms'), U('m'))).toMatchObject(
      F(2)
    );
    expect(
      convertBetweenUnits(F(2000000), U('meters'), U('miles'))
    ).toMatchObject(F(2000000, 1609));
    expect(convertBetweenUnits(F(1.243), U('mile'), U('meter'))).toMatchObject(
      F(2199008961900839, 1099511627776)
    );
    expect(convertBetweenUnits(F(20), U('feet'), U('miles'))).toMatchObject(
      F(20000, 5279129)
    );
    expect(
      convertBetweenUnits(F(20), U('smoot'), U('angstroms'))
    ).toMatchObject(F(340400000000));
    expect(convertBetweenUnits(F(20), U('nmi'), U('miles'))).toMatchObject(
      F(37040, 1609)
    );
    expect(convertBetweenUnits(F(20), U('furlong'), U('yard'))).toMatchObject(
      F(4400)
    );
    expect(convertBetweenUnits(F(4400), U('yard'), U('furlong'))).toMatchObject(
      F(20)
    );
    expect(convertBetweenUnits(F(2), U('angstroms'), U('feet'))).toMatchObject(
      F(3281, 5000000000000)
    );
  });

  it('converts between volume units', () => {
    expect(
      convertBetweenUnits(F(2), U('cubicmeters'), U('liters'))
    ).toMatchObject(F(2000, 1));
    expect(
      convertBetweenUnits(F(2000), U('liters'), U('cubicmeters'))
    ).toMatchObject(F(2));
  });

  it('converts between pressure units', () => {
    expect(
      convertBetweenUnits(F(2), U('atmosphere'), U('pascal'))
    ).toMatchObject(F(202650, 1));
    expect(
      convertBetweenUnits(F(202650.0547661773), U('pascal'), U('atmosphere'))
    ).toMatchObject(F(6963002862026723, 3481500490137600));
    expect(convertBetweenUnits(F(2), U('atmosphere'), U('bar'))).toMatchObject(
      F(4053, 2000)
    );
    expect(
      convertBetweenUnits(F(2.0265), U('bar'), U('atmosphere'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), U('atm'), U('mmhg'))).toMatchObject(
      F(1520)
    );
    expect(convertBetweenUnits(F(1520), U('mmhg'), U('atm'))).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(1520), U('torr'), U('atm'))).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(14.696), U('psi'), U('atm'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(2.9), U('bar'), U('psi'))).toMatchObject(
      F(852368, 20265)
    );
  });

  it('converts between energy units', () => {
    expect(convertBetweenUnits(F(2), U('joules'), U('calories'))).toMatchObject(
      F(1, 2092)
    );
    expect(
      convertBetweenUnits(F(0.0004780114722753346), U('calorie'), U('joule'))
    ).toMatchObject(F(2));
  });

  it('converts between mass units', () => {
    expect(convertBetweenUnits(F(2), U('pounds'), U('gram'))).toMatchObject(
      F(181437, 200)
    );
    expect(
      convertBetweenUnits(F(907.185), U('grams'), U('pound'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), U('ounces'), U('grams'))).toMatchObject(
      F(56699, 1000)
    );
    expect(
      convertBetweenUnits(F(56.699), U('grams'), U('ounces'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), U('tons'), U('grams'))).toMatchObject(
      F(2e6)
    );
    expect(convertBetweenUnits(F(2e6), U('grams'), U('tons'))).toMatchObject(
      F(2)
    );
  });

  it('converts between temperature units', () => {
    expect(
      convertBetweenUnits(F(2000), U('celsius'), U('kelvin'))
    ).toMatchObject(F(45463, 20));
    expect(
      convertBetweenUnits(F(2273.15), U('kelvin'), U('celsius'))
    ).toMatchObject(F(2000));
    expect(
      convertBetweenUnits(F(2000), U('fahrenheit'), U('kelvin'))
    ).toMatchObject(F(81989, 60));
    expect(
      convertBetweenUnits(F(1366.48445), U('kelvin'), U('fahrenheit'))
    ).toMatchObject(F(200000201, 100000));
  });

  it('converts between time units', () => {
    expect(
      convertBetweenUnits(F(120), U('seconds'), U('minutes'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(0.5), U('minute'), U('second'))).toMatchObject(
      F(30)
    );
    expect(
      convertBetweenUnits(F(5400), U('seconds'), U('hours'))
    ).toMatchObject(F(1.5));
    expect(
      convertBetweenUnits(F(0.75), U('hours'), U('minutes'))
    ).toMatchObject(F(45));
    expect(convertBetweenUnits(F(2), U('weeks'), U('days'))).toMatchObject(
      F(14)
    );
    expect(convertBetweenUnits(F(14), U('days'), U('weeks'))).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(2), U('months'), U('years'))).toMatchObject(
      F(2).div(12)
    );
    expect(convertBetweenUnits(F(1), U('year'), U('months'))).toMatchObject(
      F(12)
    );
  });

  it('converts between information units', () => {
    expect(convertBetweenUnits(F(2), U('bytes'), U('bit'))).toMatchObject(
      F(16)
    );
    expect(convertBetweenUnits(F(16), U('bits'), U('byte'))).toMatchObject(
      F(2)
    );
  });

  it('can convert complex units', () => {
    expect(
      convertBetweenUnits(
        F(100),
        U([u('joules'), u('m', { exp: -1 })]),
        U([u('calories'), u('foot', { exp: -1 })])
      )
    ).toMatchObject(F(12500, 1715963));
  });

  it('can convert mixed known and unknown units (1)', () => {
    expect(
      convertBetweenUnits(
        F(1),
        U([u('bananas', { known: false }), u('second', { exp: -1 })]),
        U([u('bananas', { known: false }), u('minute', { exp: -1 })])
      )
    ).toMatchObject(F(60));
  });

  it('can convert mixed known and unknown units (2)', () => {
    expect(
      convertBetweenUnits(
        F(1),
        U([u('bananas', { known: false }), u('minute', { exp: -1 })]),
        U([u('bananas', { known: false }), u('second', { exp: -1 })])
      )
    ).toMatchObject(F(1, 60));
  });
});
