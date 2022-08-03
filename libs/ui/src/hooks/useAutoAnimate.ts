import autoAnimate, { AutoAnimateOptions } from '@formkit/auto-animate';
import { useEffect, useRef } from 'react';
import {
  easing as defaultEasing,
  shortAnimationDurationMs as defaultDuration,
} from '../primitives';

/**
 * AutoAnimate hook for adding dead-simple transitions and animations to react.
 * @param options - Auto animate options or a plugin
 * @returns
 */
export function useAutoAnimate<T extends HTMLElement>({
  easing = defaultEasing,
  duration = defaultDuration,
}: Partial<AutoAnimateOptions> = {}) {
  const element = useRef<T>(null);
  useEffect(() => {
    if (element.current instanceof HTMLElement)
      autoAnimate(element.current, { easing, duration });
  }, [element, easing, duration]);
  return [element];
}
