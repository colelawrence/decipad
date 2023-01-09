import { act, renderHook } from '@testing-library/react';
import { useDelayedTrue, useDelayedValue } from './delay-value';

it('can delay a `true` value, but go `false` instantly', async () => {
  jest.useFakeTimers();

  const renderedHook = renderHook(({ bool }) => useDelayedTrue(bool), {
    initialProps: { bool: false },
  });

  // Starts with `false`
  expect(renderedHook.result.current).toEqual(false);
  jest.advanceTimersByTime(10);
  expect(renderedHook.result.current).toEqual(false);
  await act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(renderedHook.result.current).toEqual(false);

  // Go `true`, later
  renderedHook.rerender({ bool: true });
  expect(renderedHook.result.current).toEqual(false);
  jest.advanceTimersByTime(10);
  expect(renderedHook.result.current).toEqual(false);
  await act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(renderedHook.result.current).toEqual(true);

  // Go `false`, now
  renderedHook.rerender({ bool: false });
  expect(renderedHook.result.current).toEqual(false);
});

it('can delay a value as well', async () => {
  jest.useFakeTimers();

  const { rerender, result } = renderHook(
    ({ value, bool }) => useDelayedValue(value, bool),
    { initialProps: { value: 1, bool: false } }
  );

  expect(result.current).toEqual(1);

  // Changes instantly when never seen something good
  rerender({ value: 2, bool: false });
  expect(result.current).toEqual(2);

  // Delays when `true`
  rerender({ value: 3, bool: true });
  expect(result.current).toEqual(2);
  await act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(result.current).toEqual(3);
});
