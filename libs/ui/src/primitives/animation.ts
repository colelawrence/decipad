import { css, keyframes } from '@emotion/react';
import { PropertiesHyphen } from 'csstype';

export const shortAnimationDuration = '120ms';
export const shortAnimationDurationMs = 120;

// A short transition delay can make sense to prevent
// the start of a hover transition effect
// from showing up when the user is merely
// moving the cursor quickly over the element.
export const mouseMovingOverTransitionDelay = '20ms';

export const toastTransitionDelay = 7500;

export const showTransition = 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)';

export const easing = 'cubic-bezier(0.42, 0, 0.58, 1)';

export const easingTiming = {
  easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
};

export const hoverTransitionStyles = (
  property: keyof PropertiesHyphen | Array<keyof PropertiesHyphen> | 'all',
  duration = 150
) =>
  css({
    transitionProperty: Array.isArray(property)
      ? property.join(', ')
      : property,
    transitionDuration: '30ms',
    transitionTimingFunction: easingTiming.easeIn,
    transitionDelay: '0ms',
    '&:hover': {
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: easingTiming.easeOut,
      transitionDelay: mouseMovingOverTransitionDelay,
    },
  });

export const wiggle = keyframes`
  20% {
    box-shadow:  inset -5px 0 5px 0 rgba(0,0,0,.4);
    transform: rotate(3deg);
    transform-origin: center center;
  }

  40% {
    box-shadow:  inset -11px 0 5px 0 rgba(0,0,0,.4);
    transform: rotate(-7deg);
  }

  60% {
    box-shadow:  inset -5px 0 5px 0 rgba(0,0,0,.4);
    transform: rotate(2deg);
  }

  80% {
    box-shadow:  inset -8px 0 5px 0 rgba(0,0,0,.4);
    transform: rotate(-1deg);
  }

  100% {
    box-shadow:  inset -7px 0 5px 0 rgba(0,0,0,.4);
    transform: rotate(0deg);
  }
`;

export const antiwiggle = keyframes`
  20% {
    transform:  rotate(-3deg);
  }

  40% {
    transform:   rotate(7deg);
  }

  60% {
    transform:   rotate(-2deg);
  }

  80% {
    transform:   rotate(1deg);
  }

  100% {
    transform:  rotate(0deg);
  }
`;

export const rotation = keyframes`from {transform: rotate(360deg)} to {transform: rotate(0deg)}`;

export const animationTwoColours = (one: string, two: string) =>
  keyframes`
  0% {
    background-color: ${one};
  }
  50% {
    background-color: ${two};
  }
  100% {
    background-color: ${one};
  }`;
