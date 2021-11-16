import { F, u } from '../utils';
import { convertBetweenUnits } from '.';

describe('convert', () => {
  it('throws when from unit is unknown', () => {
    expect(() => convertBetweenUnits(F(1), u('apples'), u('meters'))).toThrow(
      "Don't know how to convert between apples and meters"
    );
  });

  it('throws when to unit is unknown', () => {
    expect(() => convertBetweenUnits(F(1), u('meters'), u('jeeters'))).toThrow(
      "Don't know how to convert between meters and jeeters"
    );
  });

  it('converts between the same unit', () => {
    expect(convertBetweenUnits(F(1), u('meters'), u('meters'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(1), u('meter'), u('meters'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(1), u('meters'), u('meter'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(1), u('meters'), u('m'))).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), u('m'), u('meters'))).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), u('m'), u('metres'))).toMatchObject(F(1));
  });

  it('converts between unknown units if they are the same', () => {
    expect(convertBetweenUnits(F(2), u('bananas'), u('bananas'))).toMatchObject(
      F(2)
    );
  });

  it('throws if units are not of the same base quantity', () => {
    expect(() => convertBetweenUnits(F(1), u('meters'), u('grams'))).toThrow(
      "Don't know how to convert between meters and grams"
    );
  });

  it('converts between length units', () => {
    expect(convertBetweenUnits(F(2), u('meters'), u('inches'))).toMatchObject(
      F(393701, 5000)
    );
    expect(
      convertBetweenUnits(F(78.7402), u('inches'), u('metres'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), u('meter'), u('angstroms'))).toMatchObject(
      F(2e10)
    );
    expect(convertBetweenUnits(F(2e10), u('angstroms'), u('m'))).toMatchObject(
      F(2)
    );
    expect(
      convertBetweenUnits(F(2000000), u('meters'), u('miles'))
    ).toMatchObject(F(2000000, 1609));
    expect(convertBetweenUnits(F(1.243), u('mile'), u('meter'))).toMatchObject(
      F(2199008961900839, 1099511627776)
    );
  });

  it('converts between volume units', () => {
    expect(
      convertBetweenUnits(F(2), u('cubicmeters'), u('liters'))
    ).toMatchObject(F(2000, 1));
    expect(
      convertBetweenUnits(F(2000), u('liters'), u('cubicmeters'))
    ).toMatchObject(F(2));
  });

  it('converts between pressure units', () => {
    expect(
      convertBetweenUnits(F(2), u('atmosphere'), u('pascal'))
    ).toMatchObject(F(202650, 1));
    expect(
      convertBetweenUnits(F(202650.0547661773), u('pascal'), u('atmosphere'))
    ).toMatchObject(F(6963002862026723, 3481500490137600));
    expect(convertBetweenUnits(F(2), u('atmosphere'), u('bar'))).toMatchObject(
      F(4053, 2000)
    );
    expect(
      convertBetweenUnits(F(2.0265), u('bar'), u('atmosphere'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), u('atm'), u('mmhg'))).toMatchObject(
      F(1520)
    );
    expect(convertBetweenUnits(F(1520), u('mmhg'), u('atm'))).toMatchObject(
      F(2)
    );
  });

  it('converts between energy units', () => {
    expect(convertBetweenUnits(F(2), u('joules'), u('calories'))).toMatchObject(
      F(1, 2092)
    );
    expect(
      convertBetweenUnits(F(0.0004780114722753346), u('calorie'), u('joule'))
    ).toMatchObject(F(2));
  });

  it('converts between mass units', () => {
    expect(convertBetweenUnits(F(2), u('pounds'), u('gram'))).toMatchObject(
      F(181437, 200)
    );
    expect(
      convertBetweenUnits(F(907.185), u('grams'), u('pound'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), u('ounces'), u('grams'))).toMatchObject(
      F(56699, 1000)
    );
    expect(
      convertBetweenUnits(F(56.699), u('grams'), u('ounces'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), u('tons'), u('grams'))).toMatchObject(
      F(2e6)
    );
    expect(convertBetweenUnits(F(2e6), u('grams'), u('tons'))).toMatchObject(
      F(2)
    );
  });

  it('converts between temperature units', () => {
    expect(
      convertBetweenUnits(F(2000), u('celsius'), u('kelvin'))
    ).toMatchObject(F(45463, 20));
    expect(
      convertBetweenUnits(F(2273.15), u('kelvin'), u('celsius'))
    ).toMatchObject(F(2000));
    expect(
      convertBetweenUnits(F(2000), u('fahrenheit'), u('kelvin'))
    ).toMatchObject(F(81989, 60));
    expect(
      convertBetweenUnits(F(1366.48445), u('kelvin'), u('fahrenheit'))
    ).toMatchObject(F(200000201, 100000));
  });

  it('converts between time units', () => {
    expect(
      convertBetweenUnits(F(120), u('seconds'), u('minutes'))
    ).toMatchObject(F(2));
    expect(convertBetweenUnits(F(0.5), u('minute'), u('second'))).toMatchObject(
      F(30)
    );
    expect(
      convertBetweenUnits(F(5400), u('seconds'), u('hours'))
    ).toMatchObject(F(1.5));
    expect(
      convertBetweenUnits(F(0.75), u('hours'), u('minutes'))
    ).toMatchObject(F(45));
    expect(convertBetweenUnits(F(2), u('weeks'), u('days'))).toMatchObject(
      F(14)
    );
    expect(convertBetweenUnits(F(14), u('days'), u('weeks'))).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(2), u('months'), u('years'))).toMatchObject(
      F(2).div(12)
    );
    expect(convertBetweenUnits(F(1), u('year'), u('months'))).toMatchObject(
      F(12)
    );
  });

  it('converts between information units', () => {
    expect(convertBetweenUnits(F(2), u('bytes'), u('bit'))).toMatchObject(
      F(16)
    );
    expect(convertBetweenUnits(F(16), u('bits'), u('byte'))).toMatchObject(
      F(2)
    );
  });
});
