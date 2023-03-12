import { N } from '@decipad/number';
import { U, u } from '../utils';
import { Unit } from '../type';
import { convertBetweenUnits, normalizeUnitName } from '.';

describe('convert', () => {
  it('throws when from unit is unknown', () => {
    expect(() => convertBetweenUnits(N(1), U('apples'), U('meters'))).toThrow(
      'Inference Error: cannot-convert-between-units'
    );
  });

  it('throws when to unit is unknown', () => {
    expect(() => convertBetweenUnits(N(1), U('meters'), U('jeeters'))).toThrow(
      'Inference Error: cannot-convert-between-units'
    );
  });

  it('should pluralize', () => {
    expect(normalizeUnitName('ares')).toMatch('are');
    expect(normalizeUnitName('are')).toMatch('are');
    expect(normalizeUnitName('celsius')).toMatch('celsius');
    expect(normalizeUnitName('calories')).toMatch('calorie');
    expect(normalizeUnitName('eur')).toMatch('eur');
    expect(normalizeUnitName('usd')).toMatch('usd');
    expect(normalizeUnitName('Meter')).toMatch('meter');
    expect(normalizeUnitName('meters')).toMatch('meter');
    expect(normalizeUnitName('s')).toMatch('s');
    expect(normalizeUnitName('h')).toMatch('h');
    expect(normalizeUnitName('seconds')).toMatch('second');
    expect(normalizeUnitName('sec')).toMatch('sec');
  });

  it('converts between the same unit', () => {
    expect(convertBetweenUnits(N(1), U('meters'), U('meters'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(1), U('meter'), U('meters'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(1), U('meters'), U('meter'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(1), U('meters'), U('metres'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(567), U('seconds'), U('sec'))).toMatchObject(
      N(567)
    );
    expect(convertBetweenUnits(N(420), U('s'), U('sec'))).toMatchObject(N(420));
  });

  it('converts between unknown units if they are the same', () => {
    expect(
      convertBetweenUnits(
        N(2),
        U('bananas', { known: false }),
        U('bananas', { known: false })
      )
    ).toMatchObject(N(2));
  });

  it('throws if units are not of the same base quantity', () => {
    expect(() => convertBetweenUnits(N(1), U('meters'), U('grams'))).toThrow(
      'Inference Error: cannot-convert-between-units'
    );
  });

  it('converts between length units', () => {
    expect(
      convertBetweenUnits(N(254, 1e4), U('meters'), U('inches'))
    ).toMatchObject(N(1));
    expect(convertBetweenUnits(N(1), U('in'), U('yd'))).toMatchObject(N(1, 36));
    expect(convertBetweenUnits(N(1), U('in'), U('ft'))).toMatchObject(N(1, 12));
    expect(convertBetweenUnits(N(1), U('ft'), U('in'))).toMatchObject(N(12));
    expect(convertBetweenUnits(N(2), U('meter'), U('angstroms'))).toMatchObject(
      N(2e10)
    );
    expect(
      convertBetweenUnits(N(2e10), U('angstroms'), U('meter'))
    ).toMatchObject(N(2));
    expect(
      convertBetweenUnits(N(1_609_344, 1_000), U('meters'), U('miles'))
    ).toMatchObject(N(1));
    expect(convertBetweenUnits(N(1), U('mile'), U('ft'))).toMatchObject(
      N(5_280)
    );
    expect(
      convertBetweenUnits(N(20), U('smoot'), U('angstroms'))
    ).toMatchObject(N(340_400_000_000));
    expect(convertBetweenUnits(N(1), U('nmi'), U('meter'))).toMatchObject(
      N(1_852)
    );
    expect(convertBetweenUnits(N(20), U('furlong'), U('yard'))).toMatchObject(
      N(4_400)
    );
    expect(
      convertBetweenUnits(N(4_400), U('yard'), U('furlong'))
    ).toMatchObject(N(20));
    expect(
      convertBetweenUnits(N(100_000_000), U('angstroms'), U('meter'))
    ).toMatchObject(N(1, 100));
    expect(convertBetweenUnits(N(1), U('angstroms'), U('fm'))).toMatchObject(
      N(100000)
    );
    expect(convertBetweenUnits(N(1), U('chain'), U('feet'))).toMatchObject(
      N(66)
    );
    expect(convertBetweenUnits(N(1), U('ftm'), U('feet'))).toMatchObject(N(6));
    expect(convertBetweenUnits(N(1), U('fur'), U('mi'))).toMatchObject(N(1, 8));
    expect(convertBetweenUnits(N(1), U('fur'), U('chain'))).toMatchObject(
      N(10)
    );
    expect(convertBetweenUnits(N(1), U('fur'), U('ft'))).toMatchObject(N(660));
    expect(convertBetweenUnits(N(1), U('fur'), U('yd'))).toMatchObject(N(220));
    expect(convertBetweenUnits(N(1), U('lnk'), U('in'))).toMatchObject(
      N(198, 25)
    );
    expect(convertBetweenUnits(N(1), U('marathon'), U('meters'))).toMatchObject(
      N(42195)
    );
    expect(convertBetweenUnits(N(1), U('parsec'), U('meter'))).toMatchObject(
      // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
      N(30_856_775_814_913_673)
    );
    expect(
      convertBetweenUnits(N(1), U('lightsecond'), U('meter'))
    ).toMatchObject(N(299792458));
    expect(convertBetweenUnits(N(1), U('lightminute'), U('ls'))).toMatchObject(
      N(60)
    );
    expect(convertBetweenUnits(N(1), U('lh'), U('lightminute'))).toMatchObject(
      N(60)
    );
    expect(convertBetweenUnits(N(1), U('lh'), U('ls'))).toMatchObject(N(3600));
    expect(
      convertBetweenUnits(N(72272, 1000), U('point'), U('in'))
    ).toMatchObject(N(1));
    expect(convertBetweenUnits(N(1), U('in'), U('twip'))).toMatchObject(
      N(1_440)
    );
    expect(convertBetweenUnits(N(1), U('rope'), U('ft'))).toMatchObject(N(20));
    expect(convertBetweenUnits(N(1), U('rd'), U('ft'))).toMatchObject(
      N(165, 10)
    );
    expect(convertBetweenUnits(N(1), U('nl'), U('nmi'))).toMatchObject(N(3));
    expect(convertBetweenUnits(N(1, 1000), U('fm'), U('am'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(1), U('hand'), U('in'))).toMatchObject(N(4));
    expect(convertBetweenUnits(N(1), U('league'), U('meter'))).toMatchObject(
      N(4_828)
    );
    expect(convertBetweenUnits(N(1), U('pica'), U('points'))).toMatchObject(
      N(12)
    );
    expect(
      convertBetweenUnits(N(94_607_304_725_808), U('meter'), U('ly'))
    ).toMatchObject(N(1, 1e2));
  });

  //
  // A sample test case that also doesn't work
  //   1 Å in nmeter ==> 0.1 nmeter
  //
  it('converts the big numbers', () => {
    expect(convertBetweenUnits(N(10e11), U('bohr'), U('meter'))).toMatchObject(
      //
      // work-around (fraction.js): this is because fractions
      // fails to detect earlier fraction and internally finds this
      //
      // so we multiply `d` and `n` by `95367.431640625`
      //
      N(529177210903, 1000000000)
    );
    expect(convertBetweenUnits(N(1), U('ft3'), U('in3'))).toMatchObject(
      N(1728)
    );
    expect(convertBetweenUnits(N(1), U('yd3'), U('ft3'))).toMatchObject(N(27));
    expect(convertBetweenUnits(N(1), U('in'), U('twip'))).toMatchObject(
      N(1_440)
    );
    expect(convertBetweenUnits(N(1), U('rope'), U('ft'))).toMatchObject(N(20));
    expect(convertBetweenUnits(N(1), U('rd'), U('ft'))).toMatchObject(
      N(165, 10)
    );
    expect(convertBetweenUnits(N(1), U('nl'), U('nmi'))).toMatchObject(N(3));
    expect(convertBetweenUnits(N(1, 1000), U('fm'), U('am'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(1), U('hand'), U('in'))).toMatchObject(N(4));
    expect(convertBetweenUnits(N(1), U('league'), U('meter'))).toMatchObject(
      N(4_828)
    );
    expect(convertBetweenUnits(N(1), U('pica'), U('points'))).toMatchObject(
      N(12)
    );
    expect(
      convertBetweenUnits(N(94_607_304_725_808), U('meter'), U('ly'))
    ).toMatchObject(N(1, 1e2));
  });

  it('converts between volume units', () => {
    expect(
      convertBetweenUnits(N(2), U('cubicmeters'), U('liters'))
    ).toMatchObject(N(2_000, 1));
    expect(
      convertBetweenUnits(N(2_000), U('liters'), U('cubicmeters'))
    ).toMatchObject(N(2));
    expect(
      convertBetweenUnits(N(1), U('liters'), U('cubicmeters'))
    ).toMatchObject(N(1, 1_000));
    expect(convertBetweenUnits(N(1), U('barrel'), U('m3'))).toMatchObject(
      N(16_365_924, 1e8)
    );
    expect(convertBetweenUnits(N(1), U('gallon'), U('m3'))).toMatchObject(
      N(454_609, 1e8)
    );
    expect(convertBetweenUnits(N(1), U('acft'), U('m3'))).toMatchObject(
      N(123_348_183_754_752, 1e14)
    );
    expect(convertBetweenUnits(N(1), U('barrel'), U('gallon'))).toMatchObject(
      N(36)
    );
    expect(convertBetweenUnits(N(1), U('gallon'), U('liters'))).toMatchObject(
      N(454_609, 1e5)
    );
    expect(convertBetweenUnits(N(1), U('cup'), U('m3'))).toMatchObject(
      N(250, 1e6)
    );
    expect(convertBetweenUnits(N(1), U('tbsp'), U('cup'))).toMatchObject(
      N(15, 250)
    );
    expect(convertBetweenUnits(N(20), U('tablespoon'), U('cup'))).toMatchObject(
      N(6, 5)
    );
    expect(convertBetweenUnits(N(2), U('tbsp'), U('tsp'))).toMatchObject(N(6));
    expect(convertBetweenUnits(N(16), U('pinch'), U('teaspoon'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(2), U('dash'), U('pinch'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(8), U('pint'), U('gallon'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(8), U('floz'), U('gallon'))).toMatchObject(
      N(8, 160)
    );
  });

  it('converts speed', () => {
    expect(convertBetweenUnits(N(1), U('mph'), U('kph'))).toMatchObject(
      N(1_609_344, 1_000_000)
    );
    expect(convertBetweenUnits(N(1), U('knot'), U('kph'))).toMatchObject(
      N(1_852, 1_000)
    );
  });

  it('converts areas', () => {
    expect(convertBetweenUnits(N(1), U('hectare'), U('m2'))).toEqual(N(10_000));
    expect(convertBetweenUnits(N(10_000), U('m2'), U('hectare'))).toEqual(N(1));
    expect(convertBetweenUnits(N(83_612_736, 1e8), U('m2'), U('sqyd'))).toEqual(
      N(1)
    );
    expect(convertBetweenUnits(N(100), U('m2'), U('are'))).toEqual(N(1));
    expect(convertBetweenUnits(N(1), U('m2'), U('are'))).toEqual(N(1, 100));
    expect(
      convertBetweenUnits(N(2_589_988_110_336, 1_000_000), U('m2'), U('sqmi'))
    ).toEqual(N(1));
    expect(convertBetweenUnits(N(1_000_000), U('m²'), U('km²'))).toEqual(N(1));
    expect(convertBetweenUnits(N(1), U('km²'), U('m²'))).toEqual(N(1_000_000));
    expect(convertBetweenUnits(N(9_290_304, 1e8), U('m2'), U('sqft'))).toEqual(
      N(1)
    );
    expect(convertBetweenUnits(N(1), U('sqmi'), U('sqyd'))).toEqual(
      N(3_097_600)
    );
    expect(convertBetweenUnits(N(1), U('sqyd'), U('sqft'))).toEqual(N(9));
    expect(convertBetweenUnits(N(1), U('sqft'), U('sqin'))).toEqual(N(144));
    expect(convertBetweenUnits(N(1), U('sqyd'), U('m2'))).toEqual(
      N(83_612_736, 1e8)
    );
    expect(convertBetweenUnits(N(1), U('acre'), U('m2'))).toEqual(
      N(40_468_564_224, 1e7)
    );
    expect(
      convertBetweenUnits(N(40_468_564_224, 10_000_000), U('m2'), U('acre'))
    ).toEqual(N(1));
    expect(convertBetweenUnits(N(1), U('acre'), U('sqyd'))).toEqual(N(4_840));
    expect(convertBetweenUnits(N(1), U('barony'), U('acre'))).toEqual(N(4000));
    expect(convertBetweenUnits(N(1e29), U('barn'), U('m2'))).toEqual(N(1));
  });

  it('converts between pressure units', () => {
    expect(
      convertBetweenUnits(N(2), U('atmosphere'), U('pascal'))
    ).toMatchObject(N(202_650, 1));
    expect(
      convertBetweenUnits(N(202_650), U('pascal'), U('atmosphere'))
    ).toMatchObject(N(2));
    expect(convertBetweenUnits(N(2), U('atmosphere'), U('bar'))).toMatchObject(
      N(4053, 2000)
    );
    expect(
      convertBetweenUnits(N(20265, 10000), U('bar'), U('atmosphere'))
    ).toMatchObject(N(2));
    expect(convertBetweenUnits(N(2), U('atm'), U('mmhg'))).toMatchObject(
      N(1520)
    );
    expect(convertBetweenUnits(N(1520), U('mmhg'), U('atm'))).toMatchObject(
      N(2)
    );
    expect(convertBetweenUnits(N(1520), U('torr'), U('atm'))).toMatchObject(
      N(2)
    );
    expect(
      convertBetweenUnits(N(14696, 1000), U('psi'), U('atm'))
    ).toMatchObject(N(1));
    expect(convertBetweenUnits(N(29, 10), U('bar'), U('psi'))).toMatchObject(
      N(852368, 20265)
    );
    expect(convertBetweenUnits(N(1), U('pascal'), U('bar'))).toMatchObject(
      N(1, 1e5)
    );
  });

  it('converts between energy units', () => {
    expect(convertBetweenUnits(N(3_600), U('joules'), U('wh'))).toMatchObject(
      N(1)
    );
    expect(convertBetweenUnits(N(2), U('joules'), U('calories'))).toMatchObject(
      N(250, 523)
    );
    expect(convertBetweenUnits(N(2), U('j'), U('cal'))).toMatchObject(
      N(250, 523)
    );
    expect(
      convertBetweenUnits(N(2_000, 4184), U('calorie'), U('joule'))
    ).toMatchObject(N(2));
  });

  it('converts between mass units', () => {
    expect(convertBetweenUnits(N(1), U('lbav'), U('gram'))).toMatchObject(
      N(45_359_237, 1e5)
    );
    expect(
      convertBetweenUnits(N(907185, 1000), U('grams'), U('pound'))
    ).toMatchObject(N(90718500, 45359237));
    expect(
      convertBetweenUnits(
        N(2_000_000_000, 28_349_523_125),
        U('ounces'),
        U('grams')
      )
    ).toMatchObject(N(2));
    expect(convertBetweenUnits(N(2), U('grams'), U('ounces'))).toMatchObject(
      N(2_000_000_000, 28_349_523_125)
    );
    expect(convertBetweenUnits(N(1), U('ozav'), U('lbav'))).toMatchObject(
      N(1, 16)
    );
    expect(convertBetweenUnits(N(2), U('tonne'), U('grams'))).toMatchObject(
      N(2e6)
    );
    expect(convertBetweenUnits(N(1), U('ton'), U('g'))).toMatchObject(
      N(10_160_469_088, 1e4)
    );
    expect(convertBetweenUnits(N(1), U('oz'), U('g'))).toMatchObject(N(26));
    expect(convertBetweenUnits(N(1), U('ton'), U('lbav'))).toMatchObject(
      N(2240)
    );
    expect(convertBetweenUnits(N(2e6), U('grams'), U('tonne'))).toMatchObject(
      N(2)
    );
  });

  it('converts between temperature units', () => {
    expect(
      convertBetweenUnits(N(2_000), U('celsius'), U('kelvin'))
    ).toMatchObject(N(45463, 20));
    expect(
      convertBetweenUnits(N(227315, 100), U('kelvin'), U('celsius'))
    ).toMatchObject(N(2000));
    expect(
      convertBetweenUnits(N(2_000), U('fahrenheit'), U('kelvin'))
    ).toMatchObject(N(81989, 60));
    expect(
      convertBetweenUnits(N(136648445, 100000), U('kelvin'), U('fahrenheit'))
    ).toMatchObject(N(200000201, 100000));
  });

  it('converts between time units', () => {
    expect(
      convertBetweenUnits(N(120), U('seconds'), U('minutes'))
    ).toMatchObject(N(2));
    expect(
      convertBetweenUnits(N(1, 2), U('minute'), U('second'))
    ).toMatchObject(N(30));
    expect(
      convertBetweenUnits(N(5_400), U('seconds'), U('hours'))
    ).toMatchObject(N(15, 10));
    expect(
      convertBetweenUnits(N(3, 4), U('hours'), U('minutes'))
    ).toMatchObject(N(45));
    expect(convertBetweenUnits(N(2), U('weeks'), U('days'))).toMatchObject(
      N(14)
    );
    expect(convertBetweenUnits(N(14), U('days'), U('weeks'))).toMatchObject(
      N(2)
    );
    expect(convertBetweenUnits(N(2), U('months'), U('years'))).toMatchObject(
      N(2).div(N(12))
    );
    expect(convertBetweenUnits(N(1), U('year'), U('months'))).toMatchObject(
      N(12)
    );
    expect(convertBetweenUnits(N(1), U('h'), U('s'))).toMatchObject(N(3600));
    expect(convertBetweenUnits(N(1), U('min'), U('sec'))).toMatchObject(N(60));
  });

  it('converts between information units', () => {
    expect(convertBetweenUnits(N(2), U('bytes'), U('bit'))).toMatchObject(
      N(16)
    );
    expect(convertBetweenUnits(N(16), U('bits'), U('byte'))).toMatchObject(
      N(2)
    );
    expect(convertBetweenUnits(N(20), U('bits'), U('byte'))).toMatchObject(
      N(5, 2)
    );
    expect(convertBetweenUnits(N(7, 2), U('byte'), U('bit'))).toMatchObject(
      N(28)
    );
  });

  it('can convert between known units with negative exponent', () => {
    expect(
      convertBetweenUnits(
        N(100),
        U('feet', { exp: N(-1) }),
        U('meters', { exp: N(-1) })
      )
    ).toMatchObject(N(125000, 381));
    expect(
      convertBetweenUnits(
        N(1),
        U('ft', { exp: N(-1) }),
        U('in', { exp: N(-1) })
      )
    ).toMatchObject(N(1, 12));
  });

  it('can convert between known units with negative exponent (2)', () => {
    expect(
      convertBetweenUnits(
        N(120),
        U('minute', { exp: N(-1) }),
        U('second', { exp: N(-1) })
      )
    ).toMatchObject(N(2));
  });

  it('can convert between known units with negative exponent (3)', () => {
    expect(
      convertBetweenUnits(
        N(2),
        U('second', { exp: N(-1) }),
        U('minute', { exp: N(-1) })
      )
    ).toMatchObject(N(120));
  });

  it('can convert between known units with negative exponent (4)', () => {
    expect(
      convertBetweenUnits(
        N(2),
        U('minute', { exp: N(-1) }),
        U('minute', { exp: N(-1) })
      )
    ).toMatchObject(N(2));
  });

  it('can convert between complex units (1)', () => {
    expect(convertBetweenUnits(N(100), U('joules'), U('joules'))).toMatchObject(
      N(100)
    );
  });

  it('can convert between complex units (2)', () => {
    expect(
      convertBetweenUnits(N(100), U('joules'), U('calories'))
    ).toMatchObject(N(12500, 523));
  });

  it('can convert between complex units (3)', () => {
    expect(
      convertBetweenUnits(
        N(100),
        U([u('joules'), u('meter', { exp: N(-1) })]),
        U([u('calories'), u('foot', { exp: N(-1) })])
      )
    ).toMatchObject(N(3810, 523));
  });

  it('can convert mixed known and unknown units (1)', () => {
    expect(
      convertBetweenUnits(
        N(2),
        U([u('bananas', { known: false }), u('second', { exp: N(-1) })]),
        U([u('bananas', { known: false }), u('minute', { exp: N(-1) })])
      )
    ).toMatchObject(N(120));
  });

  it('can convert mixed known and unknown units (2)', () => {
    expect(
      convertBetweenUnits(
        N(120),
        U([u('bananas', { known: false }), u('minute', { exp: N(-1) })]),
        U([u('bananas', { known: false }), u('second', { exp: N(-1) })])
      )
    ).toMatchObject(N(2));
  });

  it('can convert between units with multipliers expoentiated', () => {
    expect(
      convertBetweenUnits(
        N(2000),
        U([u('meters', { multiplier: N(1000), exp: N(2) })]),
        U([u('meters', { multiplier: N(1), exp: N(2) })])
      )
    ).toMatchObject(N(2_000));
  });

  it('can convert between units with multipliers negatively expoentiated', () => {
    expect(
      convertBetweenUnits(
        N(2000),
        U([u('meters', { multiplier: N(1000), exp: N(-2) })]),
        U([u('meters', { multiplier: N(1), exp: N(-2) })])
      )
    ).toMatchObject(N(2000));
  });

  it('can convert complex units with multipliers negatively expoentiated', () => {
    expect(
      convertBetweenUnits(
        N(2),
        U([
          u('grams'),
          u('meter', { exp: N(-1) }),
          u('second', { exp: N(-1) }),
        ]),
        U([u('grams'), u('meter', { exp: N(-1) }), u('second', { exp: N(-1) })])
      )
    ).toMatchObject(N(2));
  });

  it('expands on conversion', () => {
    expect(
      convertBetweenUnits(
        N(2),
        U('newton'),
        U([u('grams'), u('meter', { exp: N(1) }), u('second', { exp: N(-2) })])
      )
    ).toMatchObject(N(2000));
  });

  it('converts between cubic meters and liters', () => {
    expect(
      convertBetweenUnits(N(2), U('meters', { exp: N(3) }), U('liters'))
    ).toMatchObject(N(2000));
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('converts ambigious volumes (ounce, etc) into volumes', () => {
    expect(convertBetweenUnits(N(1), U('ton'), U('grams'))).toMatchObject(
      N(10160469088, 10e6)
    );
    expect(
      convertBetweenUnits(N(1), U('ton_displacement'), U('ft3')).valueOf()
    ).toBe(35);
  });

  it('can convert between invertible units', () => {
    expect(
      convertBetweenUnits(
        N(1),
        U([u('bananas'), u('second', { exp: N(-1) })]),
        U([u('second'), u('banana', { exp: N(-1) })])
      )
    ).toMatchObject(N(1));

    expect(
      convertBetweenUnits(
        N(1),
        U([u('second'), u('banana', { exp: N(-1) })]),
        U([u('banana'), u('minute', { exp: N(-1) })])
      )
    ).toMatchObject(N(60));

    expect(
      convertBetweenUnits(
        N(1),
        U([u('bananas'), u('second', { exp: N(-2) })]),
        U([u('second', { exp: N(2) }), u('banana', { exp: N(-1) })])
      )
    ).toMatchObject(N(1));

    expect(
      convertBetweenUnits(
        N(1),
        U([u('bananas'), u('man'), u('second', { exp: N(-1) })]),
        U([
          u('second', { exp: N(1) }),
          u('banana', { exp: N(-1) }),
          u('man', { exp: N(-1) }),
        ])
      )
    ).toMatchObject(N(1));
  });
});

describe('imprecise conversions', () => {
  const loose = (f: number, from: Unit[], to: Unit[]) =>
    convertBetweenUnits(N(f), from, to, { tolerateImprecision: true });

  it('converts months to days', () => {
    expect(loose(-1, U('month'), U('day'))).toMatchInlineSnapshot(
      `DeciNumber(-30)`
    );
    expect(loose(1, U('month'), U('day'))).toMatchInlineSnapshot(
      `DeciNumber(30)`
    );
    expect(loose(1.5, U('month'), U('day'))).toMatchInlineSnapshot(
      `DeciNumber(45)`
    );
    expect(loose(2, U('month'), U('day'))).toMatchInlineSnapshot(
      `DeciNumber(60)`
    );
    expect(loose(1, U('month'), U('second'))).toMatchInlineSnapshot(
      `DeciNumber(2592000)`
    );
    expect(
      loose(30, U('month', { exp: N(-1n) }), U('day', { exp: N(-1n) }))
    ).toMatchInlineSnapshot(`DeciNumber(1)`);
  });

  it('converts days to months', () => {
    expect(loose(30, U('day'), U('month'))).toMatchInlineSnapshot(
      `DeciNumber(1)`
    );
    expect(loose(15, U('day'), U('month'))).toMatchInlineSnapshot(
      `DeciNumber(0.5)`
    );
    expect(
      loose(1, U('day', { exp: N(-1n) }), U('month', { exp: N(-1n) }))
    ).toMatchInlineSnapshot(`DeciNumber(30)`);
  });
});
