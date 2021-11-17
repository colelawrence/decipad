import { renderHook } from '@testing-library/react-hooks';
import { useWindowListener } from './event-listener';

describe('useWindowListener', () => {
  it('attaches the listener to the window', () => {
    const listener = jest.fn();
    renderHook(() => useWindowListener('keydown', listener));

    window.dispatchEvent(new KeyboardEvent('keydown'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('removes the listener on unmount', () => {
    const listener = jest.fn();
    const { unmount } = renderHook(() =>
      useWindowListener('keydown', listener)
    );

    unmount();
    window.dispatchEvent(new KeyboardEvent('keydown'));
    expect(listener).not.toHaveBeenCalled();
  });

  it('can attach capture listeners', () => {
    const bubbleListener = jest.fn();
    const captureListener = jest.fn();
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
