import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';
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
  it('updates the state when the component is mounted', async () => {
    const { result } = renderHook(useSafeState);
    const [, setState] = result.current;
    await act(() => setState(42));
    const [state] = result.current;
    expect(state).toBe(42);
  });

  const mockedConsoleError = mockConsoleError();
  it('does not error trying to update the state after the component is unmounted', async () => {
    const { result, unmount } = renderHook(useState);
    const [, setState] = result.current;
    unmount();
    await act(() => setState(42));
    expect(mockedConsoleError).not.toHaveBeenCalled();
  });
});
