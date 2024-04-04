import type { MutableRefObject } from 'react';
import { useCallback } from 'react';
import type { AutoAnimateOptions } from '@formkit/auto-animate';
import autoAnimate from '@formkit/auto-animate';
import {
  easing as defaultEasing,
  shortAnimationDurationMs as defaultDuration,
} from '@decipad/ui';

const supportsAnimation = 'IntersectionObserver' in global;

interface AutoAnimateValue {
  onRefChange: (ref: MutableRefObject<HTMLElement | undefined>) => void;
}

function useAutoAnimate({
  easing = defaultEasing,
  duration = defaultDuration,
}: Partial<AutoAnimateOptions> = {}): AutoAnimateValue {
  const onRefChange = useCallback(
    (ref: MutableRefObject<HTMLElement | undefined>) => {
      if (supportsAnimation && ref.current instanceof HTMLElement)
        autoAnimate(ref.current, { easing, duration });
    },
    [duration, easing]
  );

  return { onRefChange };
}

export { useAutoAnimate };
