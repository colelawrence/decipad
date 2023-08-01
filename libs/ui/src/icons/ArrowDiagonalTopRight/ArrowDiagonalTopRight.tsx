import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ArrowDiagonalTopRight = (): ReturnType<FC> => (
  <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Arrow Diagonal Top Right</title>
    <g opacity="0.5">
      <path
        d="M2.28516 7.96484L7.15154 3.09846"
        stroke={cssVar('iconColorDefault')}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8.68945 2.16109V5.23507C8.68945 5.76961 8.04317 6.03731 7.66519 5.65933L4.59121 2.58535C4.21323 2.20737 4.48093 1.56109 5.01547 1.56109L8.08945 1.56109C8.42082 1.56109 8.68945 1.82972 8.68945 2.16109Z"
        fill={cssVar('iconColorHeavy')}
      />
    </g>
  </svg>
);
