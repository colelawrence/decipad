import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { getLabelIndex } from '../dimtools';
import { materializeOneResult } from '../utils/materializeOneResult';
import { FilteredColumn } from '../value';
import { createConcatenatedColumn } from './ConcatenatedColumn';
import { jsCol } from './testUtils';

setupDeciNumberSnapshotSerializer();

describe('ConcatenatedColumn', () => {
  const firstHalf = jsCol([1, 2]);
  const secondHalf = FilteredColumn.fromColumnValueAndMap(jsCol([-999, 3]), [
    false,
    true,
  ]);
  const concatenated = createConcatenatedColumn(firstHalf, secondHalf);

  it('can concat columns', async () => {
    expect(await materializeOneResult(await (await concatenated).getData()))
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

    expect((await (await concatenated).dimensions())[0]).toMatchInlineSnapshot(`
          Object {
            "dimensionLength": 3,
          }
      `);
  });

  it('can map the index to the source index', async () => {
    expect(await getLabelIndex(await concatenated, 0)).toEqual(0);
    expect(await getLabelIndex(await concatenated, 1)).toEqual(1);
    expect(await getLabelIndex(await concatenated, 2)).toEqual(1);
  });
});
