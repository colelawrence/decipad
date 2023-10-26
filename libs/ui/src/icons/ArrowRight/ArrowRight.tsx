import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ArrowRight = (): ReturnType<FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
    <title>ArrowRight</title>
    <path
      d="M9.16634 11.5L12.833 8L9.16634 4.5"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.16699 8L12.667 8"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
