import { parseSimpleValueUnit } from './parseSimpleValueUnit';

it('doesnt read numbers', () => {
  expect(parseSimpleValueUnit('10 km')).toMatchInlineSnapshot(`undefined`);
});

it('gets a unit from user input', () => {
  expect(parseSimpleValueUnit('')).toMatchInlineSnapshot(`undefined`);

  expect(parseSimpleValueUnit('%')).toMatchInlineSnapshot(`"%"`);

  expect(parseSimpleValueUnit('meter')).toMatchInlineSnapshot(`(ref meter)`);

  expect(parseSimpleValueUnit('km/second**2')).toMatchInlineSnapshot(
    `(/ (ref km) (** (ref second) 2))`
  );
});

it('ignores syntax errors and non-simplevalues', () => {
  expect(parseSimpleValueUnit('syntax//error')).toMatchInlineSnapshot(
    `undefined`
  );

  expect(parseSimpleValueUnit('complex(expression)')).toMatchInlineSnapshot(
    `undefined`
  );

  expect(parseSimpleValueUnit('complex(expression)')).toMatchInlineSnapshot(
    `undefined`
  );

  expect(
    parseSimpleValueUnit('ImNotACustomUnit', new Set(['ImNotACustomUnit']))
  ).toMatchInlineSnapshot(`undefined`);
});
