import { getLabelIndex } from '../dimtools';
import { FilteredColumn } from '../value';
import { ConcatenatedColumn } from './ConcatenatedColumn';
import { jsCol } from './testUtils';

const firstHalf = jsCol([1, 2]);
const secondHalf = new FilteredColumn(jsCol([-999, 3]), [false, true]);
const concatenated = new ConcatenatedColumn(firstHalf, secondHalf);

it('can concat columns', () => {
  expect(concatenated.getData()).toMatchInlineSnapshot(`
    Array [
      Fraction(1),
      Fraction(2),
      Fraction(3),
    ]
  `);

  expect(concatenated.dimensions[0]).toMatchInlineSnapshot(`
    Object {
      "dimensionLength": 3,
    }
  `);
});

it('can map the index to the source index', () => {
  expect(getLabelIndex(concatenated, 0)).toEqual(0);
  expect(getLabelIndex(concatenated, 1)).toEqual(1);
  expect(getLabelIndex(concatenated, 2)).toEqual(1);
});
