import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Frame = (): ReturnType<FC> => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Frame</title>
    <path
      d="M4.75 19.25L9 18.25L18.9491 8.30083C19.3397 7.9103 19.3397 7.27714 18.9491 6.88661L17.1134 5.05083C16.7228 4.6603 16.0897 4.6603 15.6991 5.05083L5.75 15L4.75 19.25Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.0234 7.03906L17.0234 10.0391"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
