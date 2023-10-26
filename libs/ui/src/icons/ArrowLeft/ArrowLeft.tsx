import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ArrowLeft = (): ReturnType<FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
    <title>ArrowLeft</title>
    <path
      d="M6.83317 4.5L3.1665 8L6.83317 11.5"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.8335 8H3.3335"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
