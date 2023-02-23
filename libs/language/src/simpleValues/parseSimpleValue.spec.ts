import { N } from '@decipad/number';
import { num } from '../utils';
import { parseSimpleValue } from './parseSimpleValue';

it('parses a simple value and its unit', () => {
  expect(parseSimpleValue('')).toMatchInlineSnapshot(`undefined`);
  expect(parseSimpleValue('10')).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(10),
      "unit": undefined,
    }
  `);
  expect(parseSimpleValue('10%')).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(10),
      "unit": "%",
    }
  `);
  expect(parseSimpleValue('10 km/s**-1')).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(10),
      "unit": (/ (ref km) (** (ref s) -1)),
    }
  `);
  expect(parseSimpleValue('10.33 seconds')).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(10.33),
      "unit": (ref seconds),
    }
  `);
  expect(parseSimpleValue('10.33%')).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(10.33),
      "unit": "%",
    }
  `);
  expect(
    parseSimpleValue('10 definedvar', new Set(['definedvar']))
  ).toMatchInlineSnapshot(`undefined`);
});

it('disallows corner case numbers', () => {
  expect(parseSimpleValue(num(N(1, 0)))).toEqual(undefined);
  expect(parseSimpleValue(num(N(1, 3)))).toEqual(undefined);
});
