import { memoizePrimitive } from './memoizePrimitive';

const memoized = jest.fn((obj: number) => 100 + obj);
const fn = memoizePrimitive(memoized);

beforeEach(() => {
  jest.clearAllMocks();
});

it('one call if same thing is passed', () => {
  const obj = 23;
  expect(fn(obj)).toEqual(123);
  expect(fn(obj)).toEqual(123);

  expect(memoized).toHaveBeenCalledTimes(1);
});
