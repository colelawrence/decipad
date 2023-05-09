import { getLabelIndex } from '../dimtools';
import { createColumnSlice } from './ColumnSlice';
import { jsCol } from './testUtils';

it('Can retrieve the original index in a sliced column', async () => {
  const values = jsCol([1, 2, 3]);

  const sliced = await createColumnSlice(values, 1, 2);
  expect(await getLabelIndex(sliced, 0)).toEqual(1);
});

it('can retrieve the original index in a twice-sliced column', async () => {
  const values = jsCol([1, 2, 3]);

  const sliced = await createColumnSlice(values, 1, 3);
  const slicedAgain = await createColumnSlice(sliced, 1, 2);

  expect(await getLabelIndex(slicedAgain, 0)).toEqual(2);
});
