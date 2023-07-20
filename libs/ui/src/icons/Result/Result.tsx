import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Result = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Result</title>
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />

    <rect
      x="10.65"
      y="11.65"
      width="18.7"
      height="13.7"
      rx="3.35"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <rect
      x="15.65"
      y="20.65"
      width="8.7"
      height="8.7"
      rx="4.35"
      fill={cssVar('backgroundColor')}
    />
    <path
      d="M15.7144 25.2143H20.053H21.4286M21.4286 25.2143L20.2823 23.7857M21.4286 25.2143L20.2823 26.6428"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <rect
      x="15.65"
      y="20.65"
      width="8.7"
      height="8.7"
      rx="4.35"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <rect
      x="14"
      y="14"
      width="8"
      height="1"
      rx="0.5"
      transform="rotate(90 14 14)"
      fill={cssVar('slashColorNormal')}
    />
  </svg>
);
