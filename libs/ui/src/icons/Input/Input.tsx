import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Input = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Input</title>
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />
    <rect
      x="10.65"
      y="13.65"
      width="18.7"
      height="13.7"
      rx="3.35"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <rect
      x="14"
      y="16.5"
      width="8"
      height="1"
      rx="0.5"
      transform="rotate(90 14 16.5)"
      fill={cssVar('slashColorNormal')}
    />
  </svg>
);
