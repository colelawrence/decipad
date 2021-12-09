import { F, U, u } from '../utils';
import { convertBetweenUnits, normalizeUnitName, prettyUnits } from '.';

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

  it('should pluralize', () => {
    // are is pluralized as `is`
    // but for us are is a unit of measure
    expect(normalizeUnitName('are')).toMatch('are');
    expect(normalizeUnitName('Meter')).toMatch('meter');
    expect(normalizeUnitName('meters')).toMatch('meter');
    expect(normalizeUnitName('s')).toMatch('s');
    expect(normalizeUnitName('h')).toMatch('h');
    expect(normalizeUnitName('seconds')).toMatch('second');
    expect(normalizeUnitName('sec')).toMatch('sec');
  });

  //
  // fixme: see https://physics.nist.gov/cuu/Units/checklist.html
  //
  it.todo('https://physics.nist.gov/cuu/Units/checklist.html');
  it('should be pretty', () => {
    expect(prettyUnits(F(1), u('meter'))).toMatch('1 m');
    expect(prettyUnits(F(1), u('squaremeter'))).toMatch('1 m²');
    expect(prettyUnits(F(1), u('squarekilometre'))).toMatch('1 km²');
    expect(prettyUnits(F(1), u('squaremile'))).toMatch('1 sq mi');
    expect(prettyUnits(F(1), u('squareyard'))).toMatch('1 sq yd');
    expect(prettyUnits(F(1), u('squarefoot'))).toMatch('1 sq ft');
    expect(prettyUnits(F(1), u('squareinch'))).toMatch('1 sq in');
    expect(prettyUnits(F(1), u('euro'))).toMatch('1 €');
    expect(prettyUnits(F(1), u('angstrom'))).toMatch('1 Å');
    expect(prettyUnits(F(1), u('usdollar'))).toMatch('1 $');
    expect(prettyUnits(F(1), u('britishpound'))).toMatch('£1');
    expect(prettyUnits(F(1, 4), u('britishpound'))).toMatch('£0.25');
    expect(prettyUnits(F(1), u('a0'))).toMatch('1 a₀');
    expect(prettyUnits(F(1), u('m3'))).toMatch('1 m³');
    expect(prettyUnits(F(1), u('in3'))).toMatch('1 in³');
    expect(prettyUnits(F(1), u('ft3'))).toMatch('1 ft³');
    expect(prettyUnits(F(1), u('cubicmile'))).toMatch('1 cu mi');
    expect(prettyUnits(F(1), u('yd3'))).toMatch('1 yd³');
    expect(prettyUnits(F(1000000), u('britishpound'))).toMatch('£1000000');
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
    expect(convertBetweenUnits(F(567), U('seconds'), U('sec'))).toMatchObject(
      F(567)
    );
    expect(convertBetweenUnits(F(420), U('s'), U('sec'))).toMatchObject(F(420));
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
    expect(
      convertBetweenUnits(F(0.0254), U('meters'), U('inches'))
    ).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), U('in'), U('yd'))).toMatchObject(F(1, 36));
    expect(convertBetweenUnits(F(1), U('in'), U('ft'))).toMatchObject(F(1, 12));
    expect(convertBetweenUnits(F(1), U('ft'), U('in'))).toMatchObject(F(12));
    expect(convertBetweenUnits(F(2), U('meter'), U('angstroms'))).toMatchObject(
      F(2e10)
    );
    expect(convertBetweenUnits(F(2e10), U('angstroms'), U('m'))).toMatchObject(
      F(2)
    );
    expect(
      convertBetweenUnits(F(1609.344), U('meters'), U('miles'))
    ).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), U('mile'), U('ft'))).toMatchObject(
      F(5_280)
    );
    expect(
      convertBetweenUnits(F(20), U('smoot'), U('angstroms'))
    ).toMatchObject(F(340_400_000_000));
    expect(convertBetweenUnits(F(1), U('nmi'), U('m'))).toMatchObject(F(1_852));
    expect(convertBetweenUnits(F(20), U('furlong'), U('yard'))).toMatchObject(
      F(4_400)
    );
    expect(
      convertBetweenUnits(F(4_400), U('yard'), U('furlong'))
    ).toMatchObject(F(20));
    expect(
      convertBetweenUnits(F(100_000_000), U('angstroms'), U('m'))
    ).toMatchObject(F(1, 100));
    expect(convertBetweenUnits(F(1), U('angstroms'), U('fm'))).toMatchObject(
      F(100000)
    );
    expect(convertBetweenUnits(F(1), U('chain'), U('feet'))).toMatchObject(
      F(66)
    );
    expect(convertBetweenUnits(F(1), U('ftm'), U('feet'))).toMatchObject(F(6));
    expect(convertBetweenUnits(F(1), U('fur'), U('mi'))).toMatchObject(F(1, 8));
    expect(convertBetweenUnits(F(1), U('fur'), U('chain'))).toMatchObject(
      F(10)
    );
    expect(convertBetweenUnits(F(1), U('fur'), U('ft'))).toMatchObject(F(660));
    expect(convertBetweenUnits(F(1), U('fur'), U('yd'))).toMatchObject(F(220));
    expect(convertBetweenUnits(F(1), U('lnk'), U('in'))).toMatchObject(
      F(198, 25)
    );
    expect(convertBetweenUnits(F(1), U('marathon'), U('meters'))).toMatchObject(
      F(42195)
    );
    expect(convertBetweenUnits(F(1), U('parsec'), U('m'))).toMatchObject(
      F(30_856_775_814_913_673)
    );
    expect(convertBetweenUnits(F(1), U('lightsecond'), U('m'))).toMatchObject(
      F(299792458)
    );
    expect(convertBetweenUnits(F(1), U('lm'), U('ls'))).toMatchObject(F(60));
    expect(convertBetweenUnits(F(1), U('lh'), U('lm'))).toMatchObject(F(60));
    expect(convertBetweenUnits(F(1), U('lh'), U('ls'))).toMatchObject(F(3600));
    expect(convertBetweenUnits(F(72.272), U('point'), U('in'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(1), U('in'), U('twip'))).toMatchObject(
      F(1_440)
    );
    expect(convertBetweenUnits(F(1), U('rope'), U('ft'))).toMatchObject(F(20));
    expect(convertBetweenUnits(F(1), U('rd'), U('ft'))).toMatchObject(F(16.5));
    expect(convertBetweenUnits(F(1), U('nl'), U('nmi'))).toMatchObject(F(3));
    expect(convertBetweenUnits(F(0.001), U('fm'), U('am'))).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), U('hand'), U('in'))).toMatchObject(F(4));
    expect(convertBetweenUnits(F(1), U('league'), U('m'))).toMatchObject(
      F(4_828)
    );
    expect(convertBetweenUnits(F(1), U('pica'), U('points'))).toMatchObject(
      F(12)
    );
    expect(
      convertBetweenUnits(F(94_607_304_725_808), U('m'), U('ly'))
    ).toMatchObject(F(1, 1e2));
  });

  it.todo('nanometers');

  //
  // A sample test case that also doesn't work
  //   1 Å in nm ==> 0.1 nm
  //
  it('converts the big numbers', () => {
    expect(convertBetweenUnits(F(10e11), U('bohr'), U('m'))).toMatchObject(
      //
      // work-around (fraction.js): this is because fractions
      // fails to detect earlier fraction and internally finds this
      //
      // so we multiply `d` and `n` by `95367.431640625`
      //
      F(529_177_210_903 * 95367.431640625, 1e9 * 95367.431640625)
    );
    expect(convertBetweenUnits(F(1), U('ft3'), U('in3'))).toMatchObject(
      F(864161578125000000, 500093505859375)
    );
    expect(convertBetweenUnits(F(1), U('yd3'), U('ft3'))).toMatchObject(
      F(91142041442871090, 3375631164550781)
    );
    expect(convertBetweenUnits(F(1), U('in'), U('twip'))).toMatchObject(
      F(1_440)
    );
    expect(convertBetweenUnits(F(1), U('rope'), U('ft'))).toMatchObject(F(20));
    expect(convertBetweenUnits(F(1), U('rd'), U('ft'))).toMatchObject(F(16.5));
    expect(convertBetweenUnits(F(1), U('nl'), U('nmi'))).toMatchObject(F(3));
    expect(convertBetweenUnits(F(0.001), U('fm'), U('am'))).toMatchObject(F(1));
    expect(convertBetweenUnits(F(1), U('hand'), U('in'))).toMatchObject(F(4));
    expect(convertBetweenUnits(F(1), U('league'), U('m'))).toMatchObject(
      F(4_828)
    );
    expect(convertBetweenUnits(F(1), U('pica'), U('points'))).toMatchObject(
      F(12)
    );
    expect(
      convertBetweenUnits(F(94_607_304_725_808), U('m'), U('ly'))
    ).toMatchObject(F(1, 1e2));
  });

  it('converts between volume units', () => {
    expect(
      convertBetweenUnits(F(2), U('cubicmeters'), U('liters'))
    ).toMatchObject(F(2_000, 1));
    expect(
      convertBetweenUnits(F(2_000), U('liters'), U('cubicmeters'))
    ).toMatchObject(F(2));
    expect(
      convertBetweenUnits(F(1), U('liters'), U('cubicmeters'))
    ).toMatchObject(F(1, 1_000));
    expect(convertBetweenUnits(F(1), U('barrel'), U('m3'))).toMatchObject(
      F(16_365_924, 1e8)
    );
    expect(convertBetweenUnits(F(1), U('gallon'), U('m3'))).toMatchObject(
      F(454_609, 1e8)
    );
    expect(convertBetweenUnits(F(1), U('acft'), U('m3'))).toMatchObject(
      F(123_348_183_754_752, 1e14)
    );
    expect(convertBetweenUnits(F(1), U('barrel'), U('gallon'))).toMatchObject(
      F(36)
    );
    expect(convertBetweenUnits(F(1), U('gallon'), U('liters'))).toMatchObject(
      F(454_609, 1e5)
    );
    expect(convertBetweenUnits(F(1), U('cup'), U('m3'))).toMatchObject(
      F(250, 1e6)
    );
    expect(convertBetweenUnits(F(1), U('tbsp'), U('cup'))).toMatchObject(
      F(15, 250)
    );
    expect(convertBetweenUnits(F(20), U('tablespoon'), U('cup'))).toMatchObject(
      F(6, 5)
    );
    expect(convertBetweenUnits(F(2), U('tbsp'), U('tsp'))).toMatchObject(F(6));
    expect(convertBetweenUnits(F(16), U('pinch'), U('teaspoon'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(2), U('dash'), U('pinch'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(8), U('pint'), U('gallon'))).toMatchObject(
      F(1)
    );
    expect(convertBetweenUnits(F(8), U('floz'), U('gallon'))).toMatchObject(
      F(8, 160)
    );
    /*
    expect(convertBetweenUnits(F(1), U('ton'), U('ft3'))).toMatchObject(
      F(35)
    );
    */
  });

  it.todo('need to test for ounce. floz works, but ounce throws!');

  it('converts areas', () => {
    expect(convertBetweenUnits(F(1), U('hectare'), U('m2'))).toEqual(F(10_000));
    expect(convertBetweenUnits(F(10_000), U('m2'), U('hectare'))).toEqual(F(1));
    expect(convertBetweenUnits(F(0.83612736), U('m2'), U('sqyd'))).toEqual(
      F(1)
    );
    expect(convertBetweenUnits(F(100), U('m2'), U('a'))).toEqual(F(1));
    expect(convertBetweenUnits(F(1), U('m2'), U('are'))).toEqual(F(1, 100));
    expect(
      convertBetweenUnits(F(2_589_988.110336), U('m2'), U('sqmi'))
    ).toEqual(F(1));
    expect(convertBetweenUnits(F(1_000_000), U('m²'), U('km²'))).toEqual(F(1));
    expect(convertBetweenUnits(F(1), U('km²'), U('m²'))).toEqual(F(1_000_000));
    expect(convertBetweenUnits(F(0.09290304), U('m2'), U('sqft'))).toEqual(
      F(1)
    );
    expect(convertBetweenUnits(F(1), U('sqmi'), U('sqyd'))).toEqual(
      F(3_097_600)
    );
    expect(convertBetweenUnits(F(1), U('sqyd'), U('sqft'))).toEqual(F(9));
    expect(convertBetweenUnits(F(1), U('sqft'), U('sqin'))).toEqual(F(144));
    expect(convertBetweenUnits(F(1), U('sqyd'), U('m2'))).toEqual(
      F(83_612_736, 1e8)
    );
    expect(convertBetweenUnits(F(1), U('acre'), U('m2'))).toEqual(
      F(40_468_564_224, 1e7)
    );
    expect(convertBetweenUnits(F(4_046.8564224), U('m2'), U('acre'))).toEqual(
      F(1)
    );
    expect(convertBetweenUnits(F(1), U('acre'), U('sqyd'))).toEqual(F(4_840));
    expect(convertBetweenUnits(F(1), U('barony'), U('acre'))).toEqual(F(4000));
    expect(convertBetweenUnits(F(1e29), U('barn'), U('m2'))).toEqual(F(1));
  });

  it('converts between pressure units', () => {
    expect(
      convertBetweenUnits(F(2), U('atmosphere'), U('pascal'))
    ).toMatchObject(F(202_650, 1));
    expect(
      convertBetweenUnits(F(202_650), U('pascal'), U('atmosphere'))
    ).toMatchObject(F(2));
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
      F(250, 523)
    );
    expect(
      convertBetweenUnits(F(0.4780114722753346), U('calorie'), U('joule'))
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
    expect(convertBetweenUnits(F(2), U('tonne'), U('grams'))).toMatchObject(
      F(2e6)
    );
    expect(convertBetweenUnits(F(2e6), U('grams'), U('tonne'))).toMatchObject(
      F(2)
    );
  });

  it('converts between temperature units', () => {
    expect(
      convertBetweenUnits(F(2_000), U('celsius'), U('kelvin'))
    ).toMatchObject(F(45463, 20));
    expect(
      convertBetweenUnits(F(2_273.15), U('kelvin'), U('celsius'))
    ).toMatchObject(F(2000));
    expect(
      convertBetweenUnits(F(2_000), U('fahrenheit'), U('kelvin'))
    ).toMatchObject(F(81989, 60));
    expect(
      convertBetweenUnits(F(1_366.48445), U('kelvin'), U('fahrenheit'))
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
      convertBetweenUnits(F(5_400), U('seconds'), U('hours'))
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
    expect(convertBetweenUnits(F(1), U('h'), U('s'))).toMatchObject(F(3600));
    expect(convertBetweenUnits(F(1), U('min'), U('sec'))).toMatchObject(F(60));
  });

  it('converts between information units', () => {
    expect(convertBetweenUnits(F(2), U('bytes'), U('bit'))).toMatchObject(
      F(16)
    );
    expect(convertBetweenUnits(F(16), U('bits'), U('byte'))).toMatchObject(
      F(2)
    );
  });

  it('can convert between known units with negative exponent', () => {
    expect(
      convertBetweenUnits(F(1), U('ft', { exp: -1 }), U('in', { exp: -1 }))
    ).toMatchObject(F(1, 12));
  });

  it('can convert between known units with negative exponent (2)', () => {
    expect(
      convertBetweenUnits(
        F(120),
        U('minute', { exp: -1 }),
        U('second', { exp: -1 })
      )
    ).toMatchObject(F(2));
  });

  it('can convert between known units with negative exponent (3)', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U('second', { exp: -1 }),
        U('minute', { exp: -1 })
      )
    ).toMatchObject(F(120));
  });

  it('can convert between known units with negative exponent (4)', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U('minute', { exp: -1 }),
        U('minute', { exp: -1 })
      )
    ).toMatchObject(F(2));
  });

  it('can convert between complex units (1)', () => {
    expect(convertBetweenUnits(F(100), U('joules'), U('joules'))).toMatchObject(
      F(100)
    );
  });

  it('can convert between complex units (2)', () => {
    expect(
      convertBetweenUnits(F(100), U('joules'), U('calories'))
    ).toMatchObject(F(12500, 523));
  });

  it('can convert between complex units (3)', () => {
    expect(
      convertBetweenUnits(
        F(100),
        U([u('joules'), u('m', { exp: -1 })]),
        U([u('calories'), u('foot', { exp: -1 })])
      )
    ).toMatchObject(F(3810, 523));
  });

  it('can convert mixed known and unknown units (1)', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U([u('bananas', { known: false }), u('second', { exp: -1 })]),
        U([u('bananas', { known: false }), u('minute', { exp: -1 })])
      )
    ).toMatchObject(F(120));
  });

  it('can convert mixed known and unknown units (2)', () => {
    expect(
      convertBetweenUnits(
        F(120),
        U([u('bananas', { known: false }), u('minute', { exp: -1 })]),
        U([u('bananas', { known: false }), u('second', { exp: -1 })])
      )
    ).toMatchObject(F(2));
  });

  it('can convert between units with multipliers', () => {
    expect(
      convertBetweenUnits(
        F(1),
        U([u('meters', { multiplier: 1000 })]),
        U([u('meters', { multiplier: 1 })])
      )
    ).toMatchObject(F(1000));
  });

  it('can convert between units with multipliers expoentiated', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U([u('meters', { multiplier: 1000, exp: 2 })]),
        U([u('meters', { multiplier: 1, exp: 2 })])
      )
    ).toMatchObject(F(2_000_000));
  });

  it('can convert between units with multipliers negatively expoentiated', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U([u('meters', { multiplier: 1000, exp: -2 })]),
        U([u('meters', { multiplier: 1, exp: -2 })])
      )
    ).toMatchObject(F(2, 1000000));
  });

  it('can convert complex units with multipliers negatively expoentiated', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U([u('grams'), u('meter', { exp: -1 }), u('second', { exp: -1 })]),
        U([u('grams'), u('meter', { exp: -1 }), u('second', { exp: -1 })])
      )
    ).toMatchObject(F(2));
  });

  it('expands on conversion', () => {
    expect(
      convertBetweenUnits(
        F(2),
        U('newton'),
        U([u('grams'), u('meter', { exp: 1 }), u('second', { exp: -2 })])
      )
    ).toMatchObject(F(2000));
  });

  it('converts between cubic meters and liters', () => {
    expect(
      convertBetweenUnits(F(2), U('meters', { exp: 3 }), U('liters'))
    ).toMatchObject(F(2000));
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('converts ambigious volumes (ounce, etc) into volumes', () => {
    expect(convertBetweenUnits(F(1), U('ton'), U('grams'))).toMatchObject(
      F(10160469088, 10e6)
    );
    expect(convertBetweenUnits(F(1), U('ton'), U('ft3'))).toMatchObject(F(35));
  });

  /*

  it cannot convert ton(volume) into mass
  it can convert ton(mass) into grams
  it converts ambiguous units with expansions
  it converts ton/s into g/s
  it converts ounce/m into ft3/h

  */
});
