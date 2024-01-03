// eslint-disable-next-line no-restricted-imports
import { Value, materializeOneResult } from '@decipad/language-types';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { slice, sort, unique } from './valueTransforms';

setupDeciNumberSnapshotSerializer();

describe('column value', () => {
  it('can be constructed from values', async () => {
    const column = Value.Column.fromValues(
      [1, 2, 3].map((n) => Value.fromJS(n))
    );
    expect(await materializeOneResult(await column.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
      ]
    `);
  });

  it('can be constructed from other columns', async () => {
    const column1 = Value.Column.fromValues(
      [1, 2, 3].map((n) => Value.fromJS(n))
    );
    const column2 = Value.Column.fromValues(
      [4, 5, 6].map((n) => Value.fromJS(n))
    );
    const column = Value.Column.fromValues([column1, column2]);
    expect(await materializeOneResult(await column.getData()))
      .toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ],
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 4n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 6n,
            "s": 1n,
          },
        ],
      ]
    `);
  });

  it('can be sorted', async () => {
    const originalColumn = Value.Column.fromValues(
      [3, 1, 2].map((n) => Value.fromJS(n))
    );
    const sortedColumn = await sort(originalColumn);
    expect(await materializeOneResult(await originalColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
      ]
    `);
    expect(await materializeOneResult(await sortedColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
      ]
    `);
  });

  it('can derive a column with unique values', async () => {
    const originalColumn = Value.fromJS([
      3, 1, 2, 3, 3, 5, 1, 2, 3, 0,
    ]) as Value.Column;
    const uniqueValuesColumn = await unique(originalColumn);
    expect(await materializeOneResult(await originalColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 0n,
          "s": 1n,
        },
      ]
    `);

    expect(await materializeOneResult(await uniqueValuesColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 0n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      ]
    `);
  });

  it('a column can be sliced', async () => {
    const originalColumn = Value.fromJS([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]) as Value.Column;
    const slice1 = await slice(originalColumn, 3, 7);
    const slice2 = await slice(originalColumn, 7, 9);
    expect(await materializeOneResult(await originalColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 4n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 6n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 7n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 8n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 9n,
          "s": 1n,
        },
      ]
    `);
    expect(await materializeOneResult(await slice1.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 4n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 6n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 7n,
          "s": 1n,
        },
      ]
    `);
    expect(await materializeOneResult(await slice2.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 8n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 9n,
          "s": 1n,
        },
      ]
    `);
  });
});
