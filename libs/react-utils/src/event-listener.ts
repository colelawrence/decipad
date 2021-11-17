import { useEffect } from 'react';

export const useWindowListener = <K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, event: WindowEventMap[K]) => void,
  capture?: boolean // do not allow EventListenerOptions because they re-run the effect unless memo-ed
): void =>
  useEffect(() => {
    window.addEventListener(type, listener, capture);
    return () => window.removeEventListener(type, listener, capture);
  }, [listener, capture, type]);
