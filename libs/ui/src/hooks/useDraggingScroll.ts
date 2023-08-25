import {
  DragEventHandler,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

// How close to the top/bottom the user must be before we start scrolling;
const ELEMENT_OFFSET = 200;

// How much we times the scroll by.
const SCROLL_SCALAR = 400;

interface UseDraggingScrollReturn<T extends HTMLElement> {
  readonly ref: RefObject<T>;
  readonly onDragEnd: DragEventHandler<T>;
  readonly onDragOver: DragEventHandler<T>;
}

/**
 * Used to scroll the a container when dragging events are picked up.
 * It scrolls the container up or down depending on how close to the top/bottom you are.
 *
 * It uses window.requestAnimationFrame to provide very smooth scrolling.
 *
 * @returns ref, onDragEnd, onDragOver. Use these functions on the element that
 * triggers the scrolling (It doesn't have to be the same element that is itself scrolled).
 */
export function useDraggingScroll<
  T extends HTMLElement
>(): UseDraggingScrollReturn<T> {
  const ref = useRef<T>(null);

  const animationRef = useRef<ReturnType<
    typeof window.requestAnimationFrame
  > | null>(null);

  const animationSpeedRef = useRef<number>(0);

  const AnimateScroll = useCallback(() => {
    if (!ref.current) return;

    ref.current.scrollBy(0, animationSpeedRef.current);

    if (animationRef.current) {
      animationRef.current = window.requestAnimationFrame(AnimateScroll);
    }
  }, [ref]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const onDragEnd = useCallback<DragEventHandler<T>>(() => {
    animationRef.current = null;
  }, []);

  const onDragOver = useCallback<DragEventHandler<T>>(
    (e) => {
      if (!ref.current) return;
      const element = ref.current;

      const top = element.offsetTop;
      const bottom = element.offsetTop + element.offsetHeight;

      if (e.clientY >= top && e.clientY <= top + ELEMENT_OFFSET) {
        animationSpeedRef.current = SCROLL_SCALAR * (1 / (top - e.clientY));
        if (!animationRef.current) {
          animationRef.current = window.requestAnimationFrame(AnimateScroll);
        }
      } else if (e.clientY <= bottom && e.clientY >= bottom - ELEMENT_OFFSET) {
        animationSpeedRef.current = SCROLL_SCALAR * (1 / (bottom - e.clientY));
        if (!animationRef.current) {
          animationRef.current = window.requestAnimationFrame(AnimateScroll);
        }
      } else {
        animationRef.current = null;
      }
    },
    [AnimateScroll, ref]
  );

  return {
    ref,
    onDragEnd,
    onDragOver,
  };
}
