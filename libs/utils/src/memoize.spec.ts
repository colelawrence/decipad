import { memoize } from './memoize';

const memoized = jest.fn((obj: { ret: number }) => obj.ret);
const fn = memoize(memoized);

beforeEach(() => {
  jest.clearAllMocks();
});

it('calls each time a new object is passed', () => {
  expect(fn({ ret: 1 })).toEqual(1);
  expect(fn({ ret: 1 })).toEqual(1);

  expect(memoized).toHaveBeenCalledTimes(2);
});

it('one call if same object is passed', () => {
  const obj = { ret: 1 };
  expect(fn(obj)).toEqual(1);
  expect(fn(obj)).toEqual(1);

  expect(memoized).toHaveBeenCalledTimes(1);
});
