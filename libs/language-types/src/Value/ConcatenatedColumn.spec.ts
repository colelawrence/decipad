import { expect, describe, it } from 'vitest';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { materializeOneResult } from '../utils/materializeOneResult';
import { createConcatenatedColumn } from './ConcatenatedColumn';
import { jsCol } from '../Dimension/testUtils';
import { FilteredColumn } from './FilteredColumn';
import { getLabelIndex } from '../Dimension/getLabelIndex';
import { getDimensionLength } from '../utils/getDimensionLength';

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
      [
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

    expect(
      await Promise.all(
        (
          await (await concatenated).dimensions()
        ).map(async (d) => getDimensionLength(d.dimensionLength))
      )
    ).toMatchInlineSnapshot(`
      [
        3,
      ]
    `);
  });

  it('can map the index to the source index', async () => {
    expect(await getLabelIndex(await concatenated, 0)).toEqual(0);
    expect(await getLabelIndex(await concatenated, 1)).toEqual(1);
    expect(await getLabelIndex(await concatenated, 2)).toEqual(1);
  });
});
