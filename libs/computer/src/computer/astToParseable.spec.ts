import { parseStatementOrThrow } from '@decipad/language';
import { astToParseable } from './astToParseable';

it('can get parsable things', () => {
  expect(astToParseable(parseStatementOrThrow('true'))).toMatchInlineSnapshot(`
    Object {
      "kind": "boolean",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = true')))
    .toMatchInlineSnapshot(`
    Object {
      "kind": "boolean",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = 1'))).toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = 10%')))
    .toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = 10 meters')))
    .toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = date(2020-01)')))
    .toMatchInlineSnapshot(`
    Object {
      "dateGranularity": "month",
      "dateStr": "2020-01",
      "kind": "date",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = date(2020-01-10 10:30)')))
    .toMatchInlineSnapshot(`
    Object {
      "dateGranularity": "minute",
      "dateStr": "2020-01-10 10:30",
      "kind": "date",
      "varName": "A",
    }
  `);
});
