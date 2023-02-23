import { getDefined } from '@decipad/utils';
import { parseSimpleValue } from './parseSimpleValue';
import { simpleValueToString } from './simpleValueToString';

it('can perform some operations on unitless numbers', () => {
  const num = getDefined(parseSimpleValue('1'));

  expect(num).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(1),
      "unit": undefined,
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"1"`);

  num.unit = '%';
  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"1%"`);
});

it('can perform some operations on numbers with units', () => {
  const num = getDefined(parseSimpleValue('1 meter/second**2'));

  expect(num).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(1),
      "unit": (/ (ref meter) (** (ref second) 2)),
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(
    `"1 meter / second ** 2"`
  );
});

it('can perform some operations on percentages', () => {
  const num = getDefined(parseSimpleValue('10%'));

  expect(num).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(10),
      "unit": "%",
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"10%"`);
});

it('simplifies expressions as we go', () => {
  const num = getDefined(parseSimpleValue('$10/sqft'));

  expect(num).toMatchInlineSnapshot(`
    Object {
      "ast": DeciNumber(10),
      "unit": (/ (ref $) (ref sqft)),
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"10 $ / sqft"`);
});
