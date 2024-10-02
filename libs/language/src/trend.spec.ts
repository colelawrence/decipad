import { expect, describe, it } from 'vitest';
import DeciNumber, { N } from '@decipad/number';
import { serializeType } from '.';
import { runCodeForVariables } from './testUtils';
import type { Result } from '@decipad/language-interfaces';

describe('trend builtin', () => {
  it('works for columns', async () => {
    const results = await runCodeForVariables(
      `
        TrendResult = trend([4, 40, 400])
      `,
      ['TrendResult']
    );
    const trendResultValue = results.variables
      .TrendResult as Result.Result<'trend'>['value'];
    const trendResultType = serializeType(
      results.types.TrendResult
    ) as Result.Result<'tree'>['type'];

    expect(trendResultType.kind).toBe('trend');
    expect(trendResultValue.first).toBeInstanceOf(DeciNumber);
    expect(trendResultValue.last).toBeInstanceOf(DeciNumber);
    expect(trendResultValue.diff).toBeInstanceOf(DeciNumber);
    expect(trendResultValue.first).toMatchObject(N(4));
    expect(trendResultValue.last).toMatchObject(N(400));
    expect(trendResultValue.diff).toMatchObject(N(396));
  });

  it('works for tables', async () => {
    const results = await runCodeForVariables(
      `
        TableA = {
          Col1 = ['a', 'b', 'c']
          Col2 = [4, 40, 400]
          Col3 = [true, false, true]
        }
        TableB = {
          Col1 = ['a', 'b', 'c']
          Col2 = [3, 44, 411]
          Col3 = [true, false, true]
        }
        TrendResult = trend([TableA, TableB])
      `,
      ['TrendResult']
    );
    const trendResultValue = results.variables
      .TrendResult as Result.Result<'trend'>['value'];
    const trendResultType = serializeType(
      results.types.TrendResult
    ) as Result.Result<'tree'>['type'];

    expect(trendResultType.kind).toBe('table');
    expect(trendResultType).toMatchInlineSnapshot(`
      {
        "columnNames": [
          "Col1",
          "Col2",
          "Col3",
        ],
        "columnTypes": [
          {
            "kind": "string",
          },
          {
            "kind": "trend",
            "trendOf": {
              "kind": "number",
              "unit": null,
            },
          },
          {
            "kind": "boolean",
          },
        ],
        "delegatesIndexTo": "TableA",
        "indexName": "TrendResult",
        "kind": "table",
        "rowCount": undefined,
      }
    `);
    expect(trendResultValue).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
        ],
        [
          Trend {
            "diff": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": -1n,
            },
            "first": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 4n,
              "s": 1n,
            },
            "last": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 3n,
              "s": 1n,
            },
          },
          Trend {
            "diff": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 4n,
              "s": 1n,
            },
            "first": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 40n,
              "s": 1n,
            },
            "last": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 44n,
              "s": 1n,
            },
          },
          Trend {
            "diff": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 11n,
              "s": 1n,
            },
            "first": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 400n,
              "s": 1n,
            },
            "last": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 411n,
              "s": 1n,
            },
          },
        ],
        [
          true,
          false,
          true,
        ],
      ]
    `);
  });
});
