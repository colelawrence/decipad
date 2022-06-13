import { useState } from 'react';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { mockConsoleError } from '@decipad/testutils';
import { useMounted, useSafeState } from './state';

describe('useMounted', () => {
  it('contains false before the component is mounted', () => {
    renderHook(() => expect(useMounted().current).toBe(false));
  });
  it('contains true when the component is mounted', () => {
    const {
      result: {
        current: { current },
      },
    } = renderHook(useMounted);
    expect(current).toBe(true);
  });
  it('contains false after the component is unmounted', () => {
    const { result, unmount } = renderHook(useMounted);
    unmount();
    expect(result.current.current).toBe(false);
  });
});

describe('useSafeState', () => {
  it('updates the state when the component is mounted', () => {
    const { result } = renderHook(useSafeState);
    const [, setState] = result.current;
    act(() => setState(42));
    const [state] = result.current;
    expect(state).toBe(42);
  });

  const mockedConsoleError = mockConsoleError();
  it('does not error trying to update the state after the component is unmounted', async () => {
    let { result, unmount } = renderHook(useState);
    unmount();
    let [, setState] = result.current;
    act(() => setState(42));
    expect(mockedConsoleError).toHaveBeenCalledTimes(1);
    expect(mockedConsoleError.mock.calls[0][0]).toMatch(/unmount/i);
    mockedConsoleError.mockClear();

    ({ result, unmount } = renderHook(useSafeState));
    unmount();
    [, setState] = result.current;
    act(() => setState(42));
    expect(mockedConsoleError).not.toHaveBeenCalled();
  });
});
