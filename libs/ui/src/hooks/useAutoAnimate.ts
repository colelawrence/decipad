import autoAnimate, { AutoAnimateOptions } from '@formkit/auto-animate';
import { useEffect, useRef } from 'react';
import { useCanUseDom } from '@decipad/react-utils';
import {
  easing as defaultEasing,
  shortAnimationDurationMs as defaultDuration,
} from '../primitives';

const supportsAnimation = process.browser && 'IntersectionObserver' in global;

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
  const canUseDom = useCanUseDom();
  useEffect(() => {
    if (
      canUseDom &&
      element.current instanceof HTMLElement &&
      supportsAnimation
    )
      autoAnimate(element.current, { easing, duration });
  }, [canUseDom, element, easing, duration]);
  return [element];
}
