import { FC } from 'react';
import { cssVar } from '../../primitives';

export const All = (): ReturnType<FC> => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={cssVar('iconColorHeavy')}
  >
    <title>All</title>
    <path
      d="M8 2.5V13.5"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.23682 5.25L12.7631 10.75"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.23682 10.75L12.7631 5.25"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
