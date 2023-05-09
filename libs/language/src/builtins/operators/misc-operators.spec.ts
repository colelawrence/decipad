import { parseUTCDate } from '../../date';
import { runCode } from '../../run';
import { fromJS, DateValue as LanguageDate, Range } from '../../value';
import { miscOperators as operators } from './misc-operators';
import { typeSnapshotSerializer } from '../../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

it('knows whether a range contains a value', async () => {
  expect(
    await operators.contains.fnValues?.([
      new Range({ start: fromJS(1), end: fromJS(2) }),
      fromJS(1),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    await operators.contains.fnValues?.([
      new Range({ start: fromJS(1), end: fromJS(2) }),
      fromJS(3),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);

  expect(
    await operators.contains.fnValues?.([
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-01'), 'month'),
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-31'), 'day'),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    await operators.contains.fnValues?.([
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-01'), 'day'),
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-31'), 'month'),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);
});

it('can un-unit stuff', async () => {
  expect(await runCode('stripunit(10 kilometers)')).toMatchInlineSnapshot(`
    Object {
      "type": number,
      "value": DeciNumber(10000),
    }
  `);
  expect(await runCode('stripunit(32891 bananas per johns miles)'))
    .toMatchInlineSnapshot(`
    Object {
      "type": number,
      "value": DeciNumber(32891),
    }
  `);
  expect(await runCode('stripunit(420 bruhs)')).toMatchInlineSnapshot(`
    Object {
      "type": number,
      "value": DeciNumber(420),
    }
  `);
  expect(
    await runCode(`
      x = 420 hours
      stripunit(x)
    `)
  ).toMatchInlineSnapshot(`
    Object {
      "type": number,
      "value": DeciNumber(420),
    }
  `);
});

it('should throw error when un-uniting non numbers', async () => {
  expect(await runCode('stripunit("not a number")')).toMatchInlineSnapshot(`
    Object {
      "type": InferError expected-but-got,
      "value": "not a number",
    }
  `);
});

it('removes the value and shows only the units', async () => {
  expect(await runCode('getunit(10 kilometers)')).toMatchInlineSnapshot(`
    Object {
      "type": meters,
      "value": DeciNumber(1),
    }
  `);
  expect(await runCode('getunit(32891 bananas per johns miles)'))
    .toMatchInlineSnapshot(`
    Object {
      "type": bananas.johns^-1.miles,
      "value": DeciNumber(1),
    }
  `);
  expect(await runCode('getunit(420 bruhs)')).toMatchInlineSnapshot(`
    Object {
      "type": bruhs,
      "value": DeciNumber(1),
    }
  `);
  expect(
    await runCode(`
      x = 420 hours
      getunit(x)
    `)
  ).toMatchInlineSnapshot(`
    Object {
      "type": hours,
      "value": DeciNumber(1),
    }
  `);
});
