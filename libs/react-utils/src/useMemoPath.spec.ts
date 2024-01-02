import { renderHook } from '@testing-library/react';
import { useMemoPath } from './useMemoPath';

describe('useMemoPath', () => {
  const getPath1 = () => [1, 2, 3];
  const getPath2 = () => [1, 2, 4];

  it('should treat identical paths as equal', () => {
    const { result, rerender } = renderHook(({ path }) => useMemoPath(path), {
      initialProps: { path: getPath1() },
    });

    const memoPath1 = result.current;

    rerender({ path: getPath1() });

    expect(result.current === memoPath1).toBe(true);
  });

  it('should treat different paths as not equal', () => {
    const { result, rerender } = renderHook(({ path }) => useMemoPath(path), {
      initialProps: { path: getPath1() },
    });

    rerender({ path: getPath2() });

    expect(result.current).toEqual(getPath2());
  });
});
