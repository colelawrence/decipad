import { MutableRefObject, useCallback } from 'react';
import autoAnimate, { AutoAnimateOptions } from '@formkit/auto-animate';
import {
  easing as defaultEasing,
  shortAnimationDurationMs as defaultDuration,
} from '@decipad/ui';

interface AutoAnimateValue {
  onRefChange: (ref: MutableRefObject<HTMLElement | undefined>) => void;
}

function useAutoAnimate({
  easing = defaultEasing,
  duration = defaultDuration,
}: Partial<AutoAnimateOptions> = {}): AutoAnimateValue {
  const onRefChange = useCallback(
    (ref: MutableRefObject<HTMLElement | undefined>) => {
      if (ref.current instanceof HTMLElement)
        autoAnimate(ref.current, { easing, duration });
    },
    [duration, easing]
  );

  return { onRefChange };
}

export { useAutoAnimate };
