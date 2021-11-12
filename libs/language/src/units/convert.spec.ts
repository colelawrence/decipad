import { convertBetweenUnits } from '.';

describe('convert', () => {
  it('throws when from unit is unknown', () => {
    expect(() => convertBetweenUnits(1, 'apples', 'meters')).toThrow(
      "Don't know how to convert between apples and meters"
    );
  });

  it('throws when to unit is unknown', () => {
    expect(() => convertBetweenUnits(1, 'meters', 'jeeters')).toThrow(
      "Don't know how to convert between meters and jeeters"
    );
  });

  it('converts between the same unit', () => {
    expect(convertBetweenUnits(1, 'meters', 'meters')).toBe(1);
    expect(convertBetweenUnits(1, 'meter', 'meters')).toBe(1);
    expect(convertBetweenUnits(1, 'meters', 'meter')).toBe(1);
    expect(convertBetweenUnits(1, 'meters', 'm')).toBe(1);
    expect(convertBetweenUnits(1, 'm', 'meters')).toBe(1);
    expect(convertBetweenUnits(1, 'm', 'metres')).toBe(1);
  });

  it('converts between unknown units if they are the same', () => {
    expect(convertBetweenUnits(2, 'bananas', 'bananas')).toBe(2);
  });

  it('throws if units are not of the same base quantity', () => {
    expect(() => convertBetweenUnits(1, 'meters', 'grams')).toThrow(
      "Don't know how to convert between meters and grams"
    );
  });

  it('converts between length units', () => {
    expect(convertBetweenUnits(2, 'meters', 'inches')).toBe(78.7402);
    expect(convertBetweenUnits(78.7402, 'inches', 'metres')).toBe(2);
    expect(convertBetweenUnits(2, 'meter', 'angstroms')).toBe(2e10);
    expect(convertBetweenUnits(2e10, 'angstroms', 'm')).toBe(2);
    expect(Math.round(convertBetweenUnits(2000000, 'meters', 'miles'))).toBe(
      1243
    );
    expect(Math.round(convertBetweenUnits(1.243, 'mile', 'meter'))).toBe(2000);
  });

  it('converts between volume units', () => {
    expect(convertBetweenUnits(2, 'cubicmeters', 'liters')).toBe(2000);
    expect(convertBetweenUnits(2000, 'liters', 'cubicmeters')).toBe(2);
  });

  it('converts between pressure units', () => {
    expect(Math.round(convertBetweenUnits(2, 'atmosphere', 'pascal'))).toBe(
      202650
    );
    expect(convertBetweenUnits(202650.0547661773, 'pascal', 'atmosphere')).toBe(
      2
    );
    expect(convertBetweenUnits(2, 'atmosphere', 'bar')).toBe(2.0265);
    expect(convertBetweenUnits(2.0265, 'bar', 'atmosphere')).toBe(2);
    expect(Math.round(convertBetweenUnits(2, 'atm', 'mmhg'))).toBe(1520);
    expect(Math.round(convertBetweenUnits(1520, 'mmhg', 'atm'))).toBe(2);
  });

  it('converts between energy units', () => {
    expect(convertBetweenUnits(2, 'joules', 'calories')).toBe(
      0.0004780114722753346
    );
    expect(convertBetweenUnits(0.0004780114722753346, 'calorie', 'joule')).toBe(
      2
    );
  });

  it('converts between mass units', () => {
    expect(convertBetweenUnits(2, 'pounds', 'gram')).toBe(907.185);
    expect(convertBetweenUnits(907.185, 'grams', 'pound')).toBe(2);
    expect(convertBetweenUnits(2, 'ounces', 'grams')).toBe(56.699);
    expect(convertBetweenUnits(56.699, 'grams', 'ounces')).toBe(2);
    expect(convertBetweenUnits(2, 'tons', 'grams')).toBe(2e6);
    expect(convertBetweenUnits(2e6, 'grams', 'tons')).toBe(2);
  });

  it('converts between temperature units', () => {
    expect(convertBetweenUnits(2000, 'celsius', 'kelvin')).toBe(2273.15);
    expect(convertBetweenUnits(2273.15, 'kelvin', 'celsius')).toBe(2000);
    expect(Math.round(convertBetweenUnits(2000, 'fahrenheit', 'kelvin'))).toBe(
      1366
    );
    expect(
      Math.round(convertBetweenUnits(1366.48445, 'kelvin', 'fahrenheit'))
    ).toBe(2000);
  });

  it('converts between time units', () => {
    expect(convertBetweenUnits(120, 'seconds', 'minutes')).toBe(2);
    expect(convertBetweenUnits(0.5, 'minute', 'second')).toBe(30);
    expect(convertBetweenUnits(5400, 'seconds', 'hours')).toBe(1.5);
    expect(convertBetweenUnits(0.75, 'hours', 'minutes')).toBe(45);
    expect(convertBetweenUnits(43200, 'seconds', 'days')).toBe(0.5);
    expect(convertBetweenUnits(1.5, 'days', 'seconds')).toBe(129600);
    expect(convertBetweenUnits(2, 'weeks', 'seconds')).toBe(1209600);
    expect(convertBetweenUnits(1209600, 'seconds', 'weeks')).toBe(2);
  });

  it('converts between information units', () => {
    expect(convertBetweenUnits(2, 'bytes', 'bit')).toBe(16);
    expect(convertBetweenUnits(16, 'bits', 'byte')).toBe(2);
  });
});
