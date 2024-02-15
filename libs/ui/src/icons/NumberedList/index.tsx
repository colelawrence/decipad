import { FC } from 'react';
import { cssVar } from '../../primitives';

export const NumberedList = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>NumberedList</title>
    <path
      d="M7.5 11H13.5"
      stroke={cssVar('iconColorHeavy')}
      stroke-width="1.3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <line
      x1="7.65"
      y1="4.35"
      x2="13.55"
      y2="4.35"
      stroke={cssVar('iconColorHeavy')}
      stroke-width="1.3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.2 3.67779L3.46666 2.20001V6"
      stroke={cssVar('iconColorHeavy')}
      stroke-width="0.886664"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.54546 9.95294C2.54546 9.71471 2.74182 9 3.52727 9C4.31273 9 4.50909 9.47647 4.50909 9.95294C4.50909 10.4294 4.06787 11.0959 3.52727 11.6206C2.98668 12.1453 2.46364 12.8118 2.3 13.05H5"
      stroke={cssVar('iconColorHeavy')}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="0.944999"
    />
  </svg>
);
