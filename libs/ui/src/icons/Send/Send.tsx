import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Send = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Send</title>
    <path
      d="M3.16634 3.16699L12.833 8.00033L3.16634 12.8337L5.49967 8.00033L3.16634 3.16699Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.66667 8L7.5 8"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
