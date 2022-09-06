import { toFraction } from '@decipad/fraction';
import { inverseExponent } from '@decipad/language';
import { formatUnit, simpleFormatUnit } from './formatUnit';
import { F, U, u } from './testUtils';

const meter = u('meters');
const second = u('seconds');
const cm = u('m', { multiplier: toFraction(1, 100) });
const kw = u('W', { multiplier: toFraction(1000) });

const locale = 'en-US';

describe('base unit tests', () => {
  it('runs a single test', () => {
    expect(
      formatUnit(locale, U([u('m'), u('kg'), inverseExponent(u('s'))]))
    ).toEqual('m·kg·s⁻¹');
  });

  it('crazy multipliers', () => {
    expect(
      formatUnit(locale, U([u('meter', { multiplier: toFraction(10000) })]))
    ).toEqual('×10⁴ meters');
  });

  it('can follow SI units rules and style conventions', () => {
    expect(formatUnit(locale, U('s'))).toEqual('s');
    expect(formatUnit(locale, U(second))).toEqual('seconds');
    // cm = 0.01m
    expect(formatUnit(locale, U([cm]))).toEqual('cm');
    expect(
      formatUnit(locale, U([u('meter', { multiplier: toFraction(1, 100) })]))
    ).toEqual('centimeters');
    expect(formatUnit(locale, U([meter, inverseExponent(second)]))).toEqual(
      'meters per second'
    );
    expect(formatUnit(locale, U([meter, inverseExponent(second)]))).toEqual(
      'meters per second'
    );
    expect(formatUnit(locale, U([u('m'), inverseExponent(u('s'))]))).toEqual(
      'm/s'
    );
    expect(formatUnit(locale, U([u('meter'), u('banana')]))).toEqual(
      'meters·banana'
    );
    expect(formatUnit(locale, U([u('watt'), u('hour')]))).toEqual('W·hour');
    expect(formatUnit(locale, U([u('w'), u('h')]))).toEqual('W·h');
    expect(formatUnit(locale, U([kw, u('h')]))).toEqual('kW·h');
    // cm3 = 0.01m3
    const cm3 = U([u('m', { multiplier: toFraction(1, 100), exp: F(3) })]);
    expect(formatUnit(locale, cm3)).toEqual('cm³');
    expect(formatUnit(locale, U([u('cubicmeter')]))).toEqual('m³');
    expect(formatUnit(locale, U([u('lightyear')]))).toEqual('light year');
    expect(formatUnit(locale, U([u('ly')]))).toEqual('light year');
    expect(formatUnit(locale, U([u('$')]))).toEqual('$');
    expect(
      formatUnit(locale, U([u('m'), u('kg'), inverseExponent(u('s'))]))
    ).toEqual('m·kg·s⁻¹');
    expect(formatUnit(locale, U([cm, cm, cm]))).toEqual('μm³');
    expect(formatUnit(locale, U([u('f', { multiplier: F(1, 100) })]))).toEqual(
      'cF'
    );
    expect(formatUnit(locale, U([u('m2', { multiplier: F(1, 100) })]))).toEqual(
      'cm²'
    );
    expect(
      formatUnit(locale, U([u('sqmi', { multiplier: F(1, 100) })]))
    ).toEqual('cmi²');
    expect(
      formatUnit(locale, U([u('sqyd', { multiplier: F(1, 100) })]))
    ).toEqual('cyd²');
    expect(
      formatUnit(locale, U([u('sqft', { multiplier: F(1, 100) })]))
    ).toEqual('cft²');
    expect(
      formatUnit(locale, U([u('sqin', { multiplier: F(1, 100) })]))
    ).toEqual('cin²');
    expect(formatUnit(locale, U([u('wh', { multiplier: F(1000) })]))).toEqual(
      'kWh'
    );
    expect(formatUnit(locale, U([u('Wh', { multiplier: F(1000) })]))).toEqual(
      'kWh'
    );
    expect(formatUnit(locale, U([u('EUR', { multiplier: F(1000) })]))).toEqual(
      'k€'
    );
    expect(formatUnit(locale, U([u('c', { multiplier: F(1) })]))).toEqual('C');
    expect(formatUnit(locale, U([u('f', { multiplier: F(1) })]))).toEqual('F');
    expect(formatUnit(locale, U([u('F', { multiplier: F(1) })]))).toEqual('F');
    expect(formatUnit(locale, U([u('Hz', { multiplier: F(1) })]))).toEqual(
      'Hz'
    );
    expect(formatUnit(locale, U([u('hz', { multiplier: F(1) })]))).toEqual(
      'Hz'
    );
    expect(formatUnit(locale, U([u('W', { multiplier: F(1) })]))).toEqual('W');
    expect(formatUnit(locale, U([u('w', { multiplier: F(1) })]))).toEqual('W');
    expect(formatUnit(locale, U([u('°c', { multiplier: F(1) })]))).toEqual(
      '°C'
    );
    expect(formatUnit(locale, U([u('°C', { multiplier: F(1) })]))).toEqual(
      '°C'
    );
    expect(formatUnit(locale, U([u('SEK', { multiplier: F(1) })]))).toEqual(
      'kr'
    );
    expect(formatUnit(locale, U([u('v', { multiplier: F(1) })]))).toEqual('V');
    expect(formatUnit(locale, U([u('V', { multiplier: F(1) })]))).toEqual('V');
  });

  it('formats simply', () => {
    expect(
      simpleFormatUnit(U([u('m'), u('kg'), inverseExponent(u('s'))]))
    ).toEqual('m * kg * s^-1');
  });
});
