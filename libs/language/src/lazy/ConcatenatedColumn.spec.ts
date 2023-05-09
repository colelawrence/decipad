import { getLabelIndex } from '../dimtools';
import { materializeOneResult } from '../utils/materializeOneResult';
import { FilteredColumn } from '../value';
import { createConcatenatedColumn } from './ConcatenatedColumn';
import { jsCol } from './testUtils';

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
      DeciNumber(1),
      DeciNumber(2),
      DeciNumber(3),
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
