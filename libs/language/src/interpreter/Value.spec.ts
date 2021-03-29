import { Scalar, Column, Range, fromJS } from './Value';

it('can get from JS for testing', () => {
  expect(fromJS(1)).toEqual(Scalar.fromValue(1));
  expect(fromJS([1, 2, 3])).toEqual(
    Column.fromValues([
      Scalar.fromValue(1),
      Scalar.fromValue(2),
      Scalar.fromValue(3),
    ])
  );
});

it('can be turned into a scalar value', () => {
  const oneNumber = Scalar.fromValue(1);
  const columnOfOne = fromJS([1]);
  const columnOfMany = fromJS([1, 2, 3]);

  expect(oneNumber.asScalar()).toEqual(oneNumber);
  expect(columnOfOne.asScalar()).toBeInstanceOf(Scalar);
  expect(columnOfOne.asScalar().getData()).toEqual(1);

  expect(() => columnOfMany.asScalar()).toThrow();
});

it('can be turned into something of the desired row count', () => {
  const oneNumber = fromJS(1);
  const column = fromJS([1, 2, 3]);

  expect(oneNumber.withRowCount(3).getData()).toEqual([1, 1, 1]);
  expect(column.withRowCount(3).getData()).toEqual([1, 2, 3]);
  expect(() => column.withRowCount(10)).toThrow(/panic:/);
});

it('can represent a range', () => {
  const range = Range.fromBounds(Scalar.fromValue(0), Scalar.fromValue(10));

  expect(range.getData()).toEqual([0, 10]);
});
