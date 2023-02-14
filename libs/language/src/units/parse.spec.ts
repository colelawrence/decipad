import { N } from '@decipad/number';
import { parseUnit } from './parse';
import { u } from '../utils';

describe('parses units', () => {
  it('parses plain unknown units', () => {
    expect(parseUnit('bananas')).toMatchObject(u('bananas', { known: false }));
  });

  it('parses multiplier prefixes in unknown quantities', () => {
    expect(parseUnit('yoctobananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 1_000_000_000_000_000_000_000_000n),
        known: false,
      })
    );
    expect(parseUnit('zeptobananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 1_000_000_000_000_000_000_000n),
        known: false,
      })
    );
    expect(parseUnit('attobananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 1_000_000_000_000_000_000n),
        known: false,
      })
    );
    expect(parseUnit('femtobananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 1_000_000_000_000_000n),
        known: false,
      })
    );
    expect(parseUnit('picobananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 1_000_000_000_000n),
        known: false,
      })
    );
    expect(parseUnit('microbananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 1_000_000n),
        known: false,
      })
    );
    expect(parseUnit('millibananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 1_000n),
        known: false,
      })
    );
    expect(parseUnit('centibananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 100),
        known: false,
      })
    );
    expect(parseUnit('decibananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1, 10),
        known: false,
      })
    );
    expect(parseUnit('decabananas')).toMatchObject(
      u('bananas', {
        multiplier: N(10),
        known: false,
      })
    );
    expect(parseUnit('hectobananas')).toMatchObject(
      u('bananas', {
        multiplier: N(100),
        known: false,
      })
    );
    expect(parseUnit('kilobananas')).toMatchObject(
      u('bananas', { multiplier: N(1000), known: false })
    );
    expect(parseUnit('megabananas')).toMatchObject(
      u('bananas', { multiplier: N(1_000_000n), known: false })
    );
    expect(parseUnit('gigabananas')).toMatchObject(
      u('bananas', { multiplier: N(1_000_000_000n), known: false })
    );
    expect(parseUnit('terabananas')).toMatchObject(
      u('bananas', { multiplier: N(1_000_000_000_000n), known: false })
    );
    expect(parseUnit('petabananas')).toMatchObject(
      u('bananas', { multiplier: N(1_000_000_000_000_000n), known: false })
    );
    expect(parseUnit('exabananas')).toMatchObject(
      u('bananas', { multiplier: N(1_000_000_000_000_000_000n), known: false })
    );
    expect(parseUnit('zettabananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1_000_000_000_000_000_000_000n),
        known: false,
      })
    );
    expect(parseUnit('yottabananas')).toMatchObject(
      u('bananas', {
        multiplier: N(1_000_000_000_000_000_000_000_000n),
        known: false,
      })
    );
  });

  it('does not parse abbreviated multipler prefixes in unknown units', () => {
    expect(parseUnit('kbananas')).toMatchObject(
      u('kbananas', { known: false })
    );
  });

  it('parses abbreviated multiplier prefixes in known units', () => {
    expect(parseUnit('yWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000_000_000_000_000_000_000_000n) })
    );
    expect(parseUnit('zWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000_000_000_000_000_000_000n) })
    );
    expect(parseUnit('aWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000_000_000_000_000_000n) })
    );
    expect(parseUnit('fWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000_000_000_000_000n) })
    );
    expect(parseUnit('pWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000_000_000_000n) })
    );
    expect(parseUnit('nWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000_000_000n) })
    );
    expect(parseUnit('μWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000_000n) })
    );
    expect(parseUnit('mWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 1_000n) })
    );
    expect(parseUnit('cWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 100) })
    );
    expect(parseUnit('dWatts')).toMatchObject(
      u('Watts', { multiplier: N(1, 10) })
    );
    expect(parseUnit('Watts')).toMatchObject(u('Watts', { multiplier: N(1) }));
    expect(parseUnit('daWatts')).toMatchObject(
      u('Watts', { multiplier: N(10) })
    );
    expect(parseUnit('hWatts')).toMatchObject(
      u('Watts', { multiplier: N(100) })
    );
    expect(parseUnit('kWatts')).toMatchObject(
      u('Watts', { multiplier: N(1000) })
    );
    expect(parseUnit('MWatts')).toMatchObject(
      u('Watts', { multiplier: N(1_000_000n) })
    );
    expect(parseUnit('GWatts')).toMatchObject(
      u('Watts', { multiplier: N(1_000_000_000n) })
    );
    expect(parseUnit('TWatts')).toMatchObject(
      u('Watts', { multiplier: N(1_000_000_000_000n) })
    );
    expect(parseUnit('PWatts')).toMatchObject(
      u('Watts', { multiplier: N(1_000_000_000_000_000n) })
    );
    expect(parseUnit('EWatts')).toMatchObject(
      u('Watts', { multiplier: N(1_000_000_000_000_000_000n) })
    );
    expect(parseUnit('ZWatts')).toMatchObject(
      u('Watts', { multiplier: N(1_000_000_000_000_000_000_000n) })
    );
    expect(parseUnit('YWatts')).toMatchObject(
      u('Watts', { multiplier: N(1_000_000_000_000_000_000_000_000n) })
    );
    expect(parseUnit('cm3')).toMatchObject(
      u('m', { multiplier: N(1, 100), exp: N(3) })
    );
    expect(parseUnit('cm2')).toMatchObject(
      u('m', { multiplier: N(1, 100), exp: N(2) })
    );
    expect(parseUnit('mft2')).toMatchObject(
      u('ft', { multiplier: N(1, 1000), exp: N(2) })
    );
  });

  it('parses ambiguous units', () => {
    expect(parseUnit('k')).toMatchObject(u('k'));
    expect(parseUnit('°c')).toMatchObject(u('°c'));
  });
});
