import { ColumnLike } from '../interpreter/Value';
import { jsCol } from '../lazy/testUtils';
import { getLabelIndex } from './getLabelIndex';

it('does nothing by default', () => {
  expect(getLabelIndex(jsCol([0, 1, 2]), 1)).toEqual(1);
});

it('validates indices before returning', () => {
  expect(() => getLabelIndex(jsCol([1, 2, 3]), -2)).toThrow();
  expect(() =>
    getLabelIndex(jsCol([1, 2, 3]), null as unknown as number)
  ).toThrow();
});

it('gets .indexToLabelIndex from the ColumnLike interface, if it exists', () => {
  const column = {
    indexToLabelIndex: (i) => i + 1,
    rowCount: 3,
  } as ColumnLike;
  expect(getLabelIndex(column, 0)).toEqual(1);
  expect(getLabelIndex(column, 1)).toEqual(2);
});
