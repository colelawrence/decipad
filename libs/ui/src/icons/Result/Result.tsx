import { FC } from 'react';
import { cssVar, strongOpacity } from '../../primitives';

export const Result = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Result</title>
    <rect width="40" height="40" rx="6" fill={cssVar('slashColorLight')} />
    <rect
      x="8.65"
      y="9.65"
      width="22.7"
      height="16.7"
      rx="3.35"
      fill={cssVar('backgroundColor')}
      fillOpacity={strongOpacity}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <rect
      x="13"
      y="13"
      width="10"
      height="1.3"
      rx="0.65"
      transform="rotate(90 13 13)"
      fill={cssVar('slashColorLight')}
    />
    <rect
      x="13.5"
      y="20.5"
      width="13"
      height="13"
      rx="6.5"
      fill={cssVar('backgroundColor')}
      fillOpacity={strongOpacity}
    />
    <path
      d="M14 26.3H20.0742H22M22 26.3L20.3951 24.3M22 26.3L20.3951 28.3"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <rect
      x="13.5"
      y="20.5"
      width="13"
      height="13"
      rx="6.5"
      stroke={cssVar('slashColorHeavy')}
    />
  </svg>
);
