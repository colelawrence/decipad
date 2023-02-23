import { N } from '@decipad/number';
import { parseSimpleValue } from './parseSimpleValue';
import { parseSimpleValueUnit } from './parseSimpleValueUnit';
import {
  simpleValueToString,
  simpleValueUnitToString,
} from './simpleValueToString';
import { num } from '../utils';

it('turns a simplistic value AST into a string', () => {
  expect(
    simpleValueToString(parseSimpleValue(`1 meter`))
  ).toMatchInlineSnapshot(`"1 meter"`);

  expect(simpleValueToString(parseSimpleValue(`10%`))).toMatchInlineSnapshot(
    `"10%"`
  );

  expect(simpleValueToString(parseSimpleValue(`$10`))).toMatchInlineSnapshot(
    `"$10"`
  );

  expect(
    simpleValueToString(parseSimpleValue(`10 usdollar`))
  ).toMatchInlineSnapshot(`"10 usdollar"`);
});

it.each([
  [num(N(1, 0)), undefined],
  [num(N(1, 3)), undefined], // repeating fraction
  [num(N(1, 1)), '1'],
])('corner cases', (a1, a2) => {
  expect(simpleValueToString(parseSimpleValue(a1))).toEqual(a2);
});

it('supports complex units', () => {
  expect(
    simpleValueToString(parseSimpleValue(`1 meter second`))
  ).toMatchInlineSnapshot(`"1 meter second"`);

  expect(
    simpleValueToString(parseSimpleValue(`1 meter / second`))
  ).toMatchInlineSnapshot(`"1 meter / second"`);

  expect(
    simpleValueToString(parseSimpleValue(`1 meter ** 2`))
  ).toMatchInlineSnapshot(`"1 meter ** 2"`);

  expect(
    simpleValueToString(parseSimpleValue(`1 TODO / meter ** 2`))
  ).toMatchInlineSnapshot(`"1 TODO / meter ** 2"`);

  expect(
    simpleValueToString(parseSimpleValue(`1 meter ** 2 / USD`))
  ).toMatchInlineSnapshot(`"1 meter ** 2 / USD"`);
});

it('knows about currencies', () => {
  expect(simpleValueToString(parseSimpleValue(`$10`))).toMatchInlineSnapshot(
    `"$10"`
  );
  // The language can't handle -$10, $-10
  expect(simpleValueToString(parseSimpleValue(`-10 $`))).toMatchInlineSnapshot(
    `"-10 $"`
  );
});

it('can print just the unit', () => {
  expect(
    simpleValueUnitToString(parseSimpleValueUnit('meter'))
  ).toMatchInlineSnapshot(`"meter"`);
  expect(
    simpleValueUnitToString(parseSimpleValueUnit('%'))
  ).toMatchInlineSnapshot(`"%"`);
  expect(
    simpleValueUnitToString(parseSimpleValueUnit('meter / TODOmeter ** -1'))
  ).toMatchInlineSnapshot(`"meter / TODOmeter ** -1"`);
  expect(
    simpleValueUnitToString(parseSimpleValueUnit('$'))
  ).toMatchInlineSnapshot(`"$"`);
});
