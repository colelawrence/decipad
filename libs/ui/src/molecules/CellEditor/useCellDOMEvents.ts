import { useEffect } from 'react';

export const useCellDOMEvents = (
  eventTarget: EventTarget | undefined,
  {
    onKeyDown,
    onDoubleClick,
  }: {
    onKeyDown?: (event: KeyboardEvent) => void;
    onDoubleClick?: (event: MouseEvent) => void;
  }
) => {
  useEffect(() => {
    if (!eventTarget) return;

    const cleanup: (() => void)[] = [];

    if (onKeyDown) {
      eventTarget.addEventListener('keydown', onKeyDown as any);

      cleanup.push(() => {
        eventTarget.removeEventListener('keydown', onKeyDown as any);
      });
    }

    if (onDoubleClick) {
      eventTarget.addEventListener('dblclick', onDoubleClick as any);

      cleanup.push(() => {
        eventTarget.removeEventListener('dblclick', onDoubleClick as any);
      });
    }

    return () => {
      cleanup.forEach((fn) => fn());
    };
  }, [eventTarget, onKeyDown, onDoubleClick]);
};
