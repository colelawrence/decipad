import { compare } from './compare-values';
import { fromJS } from './Value';

it('can compare columns', () => {
  expect(compare(fromJS([1, 2]), fromJS([1, 2]))).toEqual(0);
  expect(compare(fromJS([2, 2]), fromJS([1, 2]))).toEqual(1);
  expect(compare(fromJS([0, 2]), fromJS([1, 2]))).toEqual(-1);

  expect(compare([1, 2], [1, 2])).toEqual(0);
  expect(compare([2, 2], [1, 2])).toEqual(1);
  expect(compare([0, 2], [1, 2])).toEqual(-1);
});

it('finds columns with different lengths to be different', () => {
  expect(compare([1, 2, 3], [1, 2])).toEqual(1);
  expect(compare([1, 2], [1, 2, 3])).toEqual(-1);
});
