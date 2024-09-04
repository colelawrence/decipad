import { expect, describe, it } from 'vitest';
import DeciNumber from '@decipad/number';
import { serializeType } from '.';
import { runCodeForVariables } from './testUtils';
import type { Result } from '@decipad/language-interfaces';

describe('tree builtin', () => {
  it('works with aggregations', async () => {
    const results = await runCodeForVariables(
      `
        Sum(x) = sum(x)
        Max(x) = max(x)
        Data = {
          Col1 = [1, 2, 3, 4, 5]
          Col2 = ["A", "B", "A", "B", "A"]
          Col3 = [10, 20, 30, 40, 50]
        }
        Empty = {}
        Aggregations = {
          Col1 = [Max]
          Col3 = [Sum]
        }
        TreeResult = tree(Data, Empty, Empty, Aggregations)
      `,
      ['TreeResult']
    );
    const treeResultValue = results.variables
      .TreeResult as Result.Result<'tree'>['value'];
    const treeResultType = serializeType(
      results.types.TreeResult
    ) as Result.Result<'tree'>['type'];

    expect(treeResultType.kind).toBe('tree');
    expect(treeResultType.columnNames).toHaveLength(3);
    expect(treeResultType.columnTypes).toHaveLength(3);
    expect(treeResultValue.root).toMatchInlineSnapshot(`Symbol(unknown)`);
    expect(treeResultValue.rootAggregation).toBe(undefined);
    expect(treeResultValue.columns).toHaveLength(3);
    expect(treeResultValue.columns).toMatchInlineSnapshot(`
      [
        {
          "aggregation": {
            "meta": undefined,
            "type": {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 5n,
              "s": 1n,
            },
          },
          "name": "Col1",
        },
        {
          "aggregation": undefined,
          "name": "Col2",
        },
        {
          "aggregation": {
            "meta": undefined,
            "type": {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 150n,
              "s": 1n,
            },
          },
          "name": "Col3",
        },
      ]
    `);

    for (const child of treeResultValue.children) {
      expect(child.root).toBeInstanceOf(DeciNumber);
      expect(child.columns).toHaveLength(2);
      expect(child.rootAggregation?.value).toBeInstanceOf(DeciNumber);
    }
  });
});
