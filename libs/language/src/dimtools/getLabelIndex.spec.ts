import { ColumnLikeValue } from '../value';
import { jsCol } from '../lazy/testUtils';
import { getLabelIndex } from './getLabelIndex';

it('does nothing by default', async () => {
  expect(await getLabelIndex(jsCol([0, 1, 2]), 1)).toEqual(1);
});

it('validates indices before returning', async () => {
  await expect(async () =>
    getLabelIndex(jsCol([1, 2, 3]), -2)
  ).rejects.toThrow();
  await expect(async () =>
    getLabelIndex(jsCol([1, 2, 3]), null as unknown as number)
  ).rejects.toThrow();
});

it('gets .indexToLabelIndex from the ColumnLike interface, if it exists', async () => {
  const column = {
    indexToLabelIndex: (i) => i + 1,
    rowCount: () => 3,
  } as ColumnLikeValue;
  expect(await getLabelIndex(column, 0)).toEqual(1);
  expect(await getLabelIndex(column, 1)).toEqual(2);
});
