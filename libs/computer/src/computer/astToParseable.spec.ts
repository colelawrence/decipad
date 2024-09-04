import { expect, it } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { parseStatementOrThrow } from '@decipad/language';
import { astToParseable } from './astToParseable';

it('can get parsable things', () => {
  expect(astToParseable(parseStatementOrThrow('true'))).toMatchInlineSnapshot(`
    {
      "kind": "boolean",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = true')))
    .toMatchInlineSnapshot(`
    {
      "kind": "boolean",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = 1'))).toMatchInlineSnapshot(`
    {
      "kind": "number",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = 10%')))
    .toMatchInlineSnapshot(`
    {
      "kind": "number",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = 10 meters')))
    .toMatchInlineSnapshot(`
    {
      "kind": "number",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = date(2020-01)')))
    .toMatchInlineSnapshot(`
    {
      "dateGranularity": "month",
      "dateStr": "2020-01",
      "kind": "date",
      "varName": "A",
    }
  `);
  expect(astToParseable(parseStatementOrThrow('A = date(2020-01-10 10:30)')))
    .toMatchInlineSnapshot(`
    {
      "dateGranularity": "minute",
      "dateStr": "2020-01-10 10:30",
      "kind": "date",
      "varName": "A",
    }
  `);
});
