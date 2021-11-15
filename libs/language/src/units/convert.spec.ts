import { F } from '../utils';
import { convertBetweenUnits } from '.';

describe('convert', () => {
  it('throws when from unit is unknown', () => {
    expect(() => convertBetweenUnits(F(1), 'apples', 'meters')).toThrow(
      "Don't know how to convert between apples and meters"
    );
  });

  it('throws when to unit is unknown', () => {
    expect(() => convertBetweenUnits(F(1), 'meters', 'jeeters')).toThrow(
      "Don't know how to convert between meters and jeeters"
    );
  });

  it('converts between the same unit', () => {
    expect(convertBetweenUnits(F(1), 'meters', 'meters')).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), 'meter', 'meters')).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), 'meters', 'meter')).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), 'meters', 'm')).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), 'm', 'meters')).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), 'm', 'metres')).toMatchObject(F(1));
  });

  it('converts between unknown units if they are the same', () => {
    expect(convertBetweenUnits(F(2), 'bananas', 'bananas')).toMatchObject(F(2));
  });

  it('throws if units are not of the same base quantity', () => {
    expect(() => convertBetweenUnits(F(1), 'meters', 'grams')).toThrow(
      "Don't know how to convert between meters and grams"
    );
  });

  it('converts between length units', () => {
    expect(convertBetweenUnits(F(2), 'meters', 'inches')).toMatchObject(
      F(393701, 5000)
    );
    expect(convertBetweenUnits(F(78.7402), 'inches', 'metres')).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(2), 'meter', 'angstroms')).toMatchObject(
      F(2e10)
    );
    expect(convertBetweenUnits(F(2e10), 'angstroms', 'm')).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2000000), 'meters', 'miles')).toMatchObject(
      F(2000000, 1609)
    );
    expect(convertBetweenUnits(F(1.243), 'mile', 'meter')).toMatchObject(
      F(2199008961900839, 1099511627776)
    );
  });

  it('converts between volume units', () => {
    expect(convertBetweenUnits(F(2), 'cubicmeters', 'liters')).toMatchObject(
      F(2000, 1)
    );
    expect(convertBetweenUnits(F(2000), 'liters', 'cubicmeters')).toMatchObject(
      F(2)
    );
  });

  it('converts between pressure units', () => {
    expect(convertBetweenUnits(F(2), 'atmosphere', 'pascal')).toMatchObject(
      F(14793454, 73)
    );
    expect(
      convertBetweenUnits(F(202650.0547661773), 'pascal', 'atmosphere')
    ).toMatchObject(F(7942175139499231, 3971087570305024));
    expect(convertBetweenUnits(F(2), 'atmosphere', 'bar')).toMatchObject(
      F(4053, 2000)
    );
    expect(convertBetweenUnits(F(2.0265), 'bar', 'atmosphere')).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(2), 'atm', 'mmhg')).toMatchObject(F(1520));
    expect(convertBetweenUnits(F(1520), 'mmhg', 'atm')).toMatchObject(F(2));
  });

  it('converts between energy units', () => {
    expect(convertBetweenUnits(F(2), 'joules', 'calories')).toMatchObject(
      F(1, 2092)
    );
    expect(
      convertBetweenUnits(F(0.0004780114722753346), 'calorie', 'joule')
    ).toMatchObject(F(2));
  });

  it('converts between mass units', () => {
    expect(convertBetweenUnits(F(2), 'pounds', 'gram')).toMatchObject(
      F(181437, 200)
    );
    expect(convertBetweenUnits(F(907.185), 'grams', 'pound')).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(2), 'ounces', 'grams')).toMatchObject(
      F(56699, 1000)
    );
    expect(convertBetweenUnits(F(56.699), 'grams', 'ounces')).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(2), 'tons', 'grams')).toMatchObject(F(2e6));
    expect(convertBetweenUnits(F(2e6), 'grams', 'tons')).toMatchObject(F(2));
  });

  it('converts between temperature units', () => {
    expect(convertBetweenUnits(F(2000), 'celsius', 'kelvin')).toMatchObject(
      F(45463, 20)
    );
    expect(convertBetweenUnits(F(2273.15), 'kelvin', 'celsius')).toMatchObject(
      F(2000)
    );
    expect(convertBetweenUnits(F(2000), 'fahrenheit', 'kelvin')).toMatchObject(
      F(81989, 60)
    );
    expect(
      convertBetweenUnits(F(1366.48445), 'kelvin', 'fahrenheit')
    ).toMatchObject(F(200000201, 100000));
  });

  it('converts between time units', () => {
    expect(convertBetweenUnits(F(120), 'seconds', 'minutes')).toMatchObject(
      F(2)
    );
    expect(convertBetweenUnits(F(0.5), 'minute', 'second')).toMatchObject(
      F(30)
    );
    expect(convertBetweenUnits(F(5400), 'seconds', 'hours')).toMatchObject(
      F(1.5)
    );
    expect(convertBetweenUnits(F(0.75), 'hours', 'minutes')).toMatchObject(
      F(45)
    );
    expect(convertBetweenUnits(F(2), 'weeks', 'days')).toMatchObject(F(14));
    expect(convertBetweenUnits(F(14), 'days', 'weeks')).toMatchObject(F(2));
    expect(convertBetweenUnits(F(2), 'months', 'years')).toMatchObject(
      F(2).div(12)
    );
    expect(convertBetweenUnits(F(1), 'year', 'months')).toMatchObject(F(12));
  });

  it('converts between information units', () => {
    expect(convertBetweenUnits(F(2), 'bytes', 'bit')).toMatchObject(F(16));
    expect(convertBetweenUnits(F(16), 'bits', 'byte')).toMatchObject(F(2));
  });
});
