import { expect, describe, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWindowListener } from './event-listener';

describe('useWindowListener', () => {
  it('attaches the listener to the window', () => {
    const listener = vi.fn();
    renderHook(() => useWindowListener('keydown', listener));

    window.dispatchEvent(new KeyboardEvent('keydown'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('removes the listener on unmount', () => {
    const listener = vi.fn();
    const { unmount } = renderHook(() =>
      useWindowListener('keydown', listener)
    );

    unmount();
    window.dispatchEvent(new KeyboardEvent('keydown'));
    expect(listener).not.toHaveBeenCalled();
  });

  it('can attach capture listeners', () => {
    const bubbleListener = vi.fn();
    const captureListener = vi.fn();
    renderHook(() => {
      useWindowListener('keydown', bubbleListener, false);
      useWindowListener('keydown', captureListener, true);
    });

    const stopPropagation = (event: KeyboardEvent) => event.stopPropagation();
    try {
      window.addEventListener('keydown', stopPropagation, true);

      window.dispatchEvent(new KeyboardEvent('keydown'));
      expect(bubbleListener).not.toHaveBeenCalled();
      expect(captureListener).toHaveBeenCalled();
    } finally {
      window.removeEventListener('keydown', stopPropagation, true);
    }
  });
});
