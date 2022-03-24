import { getLabelIndex } from '../dimtools';
import { ColumnSlice } from './ColumnSlice';
import { jsCol } from './testUtils';

it('Can retrieve the original index in a sliced column', () => {
  const values = jsCol([1, 2, 3]);

  const sliced = new ColumnSlice(values, 1, 2);
  expect(getLabelIndex(sliced, 0)).toEqual(1);
});

it('can retrieve the original index in a twice-sliced column', () => {
  const values = jsCol([1, 2, 3]);

  const sliced = new ColumnSlice(values, 1, 3);
  const slicedAgain = new ColumnSlice(sliced, 1, 2);

  expect(getLabelIndex(slicedAgain, 0)).toEqual(2);
});
