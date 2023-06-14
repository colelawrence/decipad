import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Image = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Image</title>
    <rect width="40" height="40" rx="6" fill={cssVar('slashColorLight')} />
    <circle
      cx="13"
      cy="13"
      r="4"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 30L10.5 25L15 30L25 14L34 30"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
